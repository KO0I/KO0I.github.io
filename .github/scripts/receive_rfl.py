"""Receive verified browser bytes only. Never execute private repository code."""
import json
import os
from pathlib import Path
import re
import shutil
import time
import urllib.error

from browser_bundle import (REPO, REPO_ID, WORKFLOW, API, LIMIT, fetch, api, download,
                            validate_origin, inspect_bundle, load_preserved)

LIVE_RECEIPT = 'https://chipchirp.digital/rfl/deployment.json'

def unpack(data, artifact, run, output, dry_run, preserved_tag=None):
    manifest, verified = inspect_bundle(data, artifact, run, dry_run)
    sha = run['head_sha']
    output = Path(output)
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)
    for name, content in verified.items():
        dest = output / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(content)
    (output / 'version.json').write_text(json.dumps(manifest, indent=2) + '\n')
    receipt = {'schema': 1, 'artifact_id': artifact['id'], 'run_id': run['id'], 'sha': sha,
               'digest': artifact['digest'], 'expires_at': None if preserved_tag else artifact['expires_at']}
    if preserved_tag:
        receipt.update(storage='private-release', release_tag=preserved_tag)
    (output / 'deployment.json').write_text(json.dumps(receipt, indent=2) + '\n')
    return receipt

def load_source(artifact_id, token, dry_run):
    try:
        saved = load_preserved(artifact_id, token)
    except urllib.error.HTTPError as error:
        # Existing Actions-only reader tokens may still validate legacy deployments.
        # Production never bypasses the durable-release requirement.
        if not dry_run or error.code != 403:
            raise
        saved = None
    if saved:
        return saved
    if not dry_run:
        raise ValueError('Production requires a preserved private browser release; archive this exact artifact first')
    artifact = api(f'/actions/artifacts/{artifact_id}', token)
    run_id = artifact['workflow_run']['id']
    if not isinstance(run_id, int):
        raise ValueError('Invalid producer run ID')
    run = api(f'/actions/runs/{run_id}', token)
    validate_origin(artifact, run, dry_run)
    return artifact, run, download(artifact_id, token), None

def main():
    dry_run = os.environ.get('RFL_DRY_RUN') == 'true'
    artifact_id = os.environ.get('RFL_ARTIFACT_ID', '')
    if not dry_run and not artifact_id:
        raise ValueError('Production requires an explicit release artifact ID')
    token = os.environ['RFL_ARTIFACTS_TOKEN']
    if not token:
        raise ValueError('Artifact reader token is not configured')
    live = None
    if not artifact_id:
        live = json.loads(fetch(LIVE_RECEIPT + '?t=' + str(time.time_ns())))
        artifact_id = str(live['artifact_id'])
    if not re.fullmatch('[1-9][0-9]*', artifact_id):
        raise ValueError('Artifact ID must be numeric')
    artifact, run, data, tag = load_source(artifact_id, token, dry_run)
    if live and any(live.get(k) != value for k, value in {
        'sha': run['head_sha'], 'run_id': run['id'], 'digest': artifact.get('digest')}.items()):
        raise ValueError('Live receipt disagrees with verified artifact')
    receipt = unpack(data, artifact, run, '_site/rfl', dry_run, preserved_tag=tag)
    print(f"Verified RFL {receipt['sha']}; artifact {receipt['artifact_id']}; Interiors excluded.")
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a') as out:
            storage = f"Private Release: `{tag}`." if tag else f"Actions artifact expires: `{receipt['expires_at']}`."
            out.write(f"RFL commit: `{receipt['sha']}`. Artifact: `{receipt['artifact_id']}`. "
                      f"{storage} Interiors excluded.\n")

if __name__ == '__main__':
    main()

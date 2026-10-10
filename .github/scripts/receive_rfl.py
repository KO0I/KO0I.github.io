"""Artifact-only receiver. Never executes code from the private repository."""
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

REPO = 'KO0I/rasd-fastwalker-league-js'
REPO_ID = 1388492646
WORKFLOW = '.github/workflows/browser-release.yml'
API = f'https://api.github.com/repos/{REPO}'
LIVE_RECEIPT = 'https://chipchirp.digital/rfl/deployment.json'
LIMIT = 500 * 1024 * 1024
EXTENSIONS = {
    '.js', '.mjs', '.css', '.html', '.svg', '.json',
    '.bin', '.png', '.woff', '.wasm', '.data',
    '.xpm', '.rnb', '.txt', '.mp3', '.mp4'
}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

def fetch(url, token=None):
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'rfl-artifact-receiver',
               'X-GitHub-Api-Version': '2022-11-28', 'Cache-Control': 'no-cache'}
    if token:
        if not url.startswith(API + '/'):
            raise ValueError('Refusing to send private token outside the fixed repository API')
        headers['Authorization'] = f'Bearer {token}'
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.build_opener(NoRedirect).open(request, timeout=60) as response:
        body = response.read(LIMIT + 1)
        if len(body) > LIMIT:
            raise ValueError('Download exceeds size limit')
        return body

def api(endpoint, token):
    return json.loads(fetch(API + endpoint, token))

def download(artifact_id, token):
    try:
        return fetch(f'{API}/actions/artifacts/{artifact_id}/zip', token)
    except urllib.error.HTTPError as error:
        if error.code != 302:
            raise
        location = error.headers['Location']
        parsed = urllib.parse.urlsplit(location)
        if parsed.scheme != 'https' or parsed.username or parsed.password:
            raise ValueError('Unsafe artifact redirect')
        # GitHub's signed storage URL is trusted only because it came from the fixed API.
        # Never forward Authorization to storage, and reject further redirects.
        return fetch(location)

def validate_origin(artifact, run, dry_run):
    expected_name = 'rfl-preview' if artifact.get('name') == 'rfl-preview' and dry_run else 'rfl-release'
    if artifact.get('name') != expected_name or artifact.get('expired') is not False:
        raise ValueError('Wrong artifact name or expired artifact')
    if artifact.get('size_in_bytes', LIMIT + 1) > LIMIT:
        raise ValueError('Artifact too large')
    origin = artifact['workflow_run']
    if origin.get('repository_id') != REPO_ID or origin.get('head_repository_id') != REPO_ID:
        raise ValueError('Artifact came from another repository or a fork')
    if run.get('path') != WORKFLOW or run.get('event') != 'workflow_dispatch':
        raise ValueError('Unexpected producer workflow/event')
    if run.get('status') != 'completed' or run.get('conclusion') != 'success':
        raise ValueError('Producer workflow has not completed successfully')
    if not dry_run and (run.get('head_branch') != 'main' or origin.get('head_branch') != 'main'):
        raise ValueError('Production accepts only main')
    sha = run.get('head_sha', '')
    if not re.fullmatch('[a-f0-9]{40}', sha) or origin.get('head_sha') != sha or origin.get('id') != run.get('id'):
        raise ValueError('Artifact/run identity mismatch')
    return sha

def unpack(data, artifact, run, output, dry_run):
    sha = validate_origin(artifact, run, dry_run)
    if artifact.get('digest') != 'sha256:' + hashlib.sha256(data).hexdigest():
        raise ValueError('GitHub artifact digest mismatch or missing digest')
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) > 3000 or sum(e.file_size for e in entries) > LIMIT:
            raise ValueError('Expanded artifact too large')
        names = set()
        for entry in entries:
            name = entry.filename
            parts = PurePosixPath(name).parts
            if (not parts or name.startswith('/') or '\\' in name or
                any(p.startswith('.') for p in parts) or
                not re.fullmatch(r'[A-Za-z0-9_./-]+', name) or 'interior' in name.lower() or
                (not entry.is_dir() and PurePosixPath(name).suffix not in EXTENSIONS)):
                raise ValueError('Forbidden archive path')
            kind = stat.S_IFMT(entry.external_attr >> 16)
            if kind not in (0, stat.S_IFREG, stat.S_IFDIR) or entry.flag_bits & 1:
                raise ValueError('Links, special files and encrypted entries are forbidden')
            if entry.is_dir():
                continue
            if name in names:
                raise ValueError('Duplicate archive path')
            names.add(name)
        if 'version.json' not in names or archive.getinfo('version.json').file_size > 1024 * 1024:
            raise ValueError('Missing/oversize manifest')
        manifest = json.loads(archive.read('version.json'))
        if (manifest.get('schema') != 1 or manifest.get('sha') != sha or
            manifest.get('run_id') != str(run['id']) or manifest.get('interiors') is not False or
            manifest.get('publish') is not (artifact['name'] == 'rfl-release')):
            raise ValueError('Manifest provenance mismatch')
        files = manifest['files']
        if names != set(files) | {'version.json'} or 'index.html' not in files:
            raise ValueError('Manifest does not exactly match payload')
        verified = {}
        for name, expected in files.items():
            content = archive.read(name)
            if len(content) != expected['size'] or hashlib.sha256(content).hexdigest() != expected['sha256']:
                raise ValueError('File checksum mismatch')
            if PurePosixPath(name).suffix in {'.js', '.mjs', '.css', '.html', '.json'} and any(
                marker in content for marker in (b'sourceMappingURL', b'sourcesContent')):
                raise ValueError('Source-map content rejected')
            verified[name] = content
        if b'shipInterior' in verified['index.html'] or b'"interior.js"' in verified.get('game-menu.js', b''):
            raise ValueError('Interiors was not excluded')
        # Validate everything before touching the assembled site's RFL directory.
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
                   'digest': artifact['digest'], 'expires_at': artifact['expires_at']}
        (output / 'deployment.json').write_text(json.dumps(receipt, indent=2) + '\n')
        return receipt

def main():
    token = os.environ['RFL_ARTIFACTS_TOKEN']
    if not token:
        raise ValueError('Artifact reader token is not configured')
    dry_run = os.environ.get('RFL_DRY_RUN') == 'true'
    artifact_id = os.environ.get('RFL_ARTIFACT_ID', '')
    live = None
    if not artifact_id:
        # Ordinary site pushes preserve the last successfully deployed release, never "latest".
        # Missing, expired or corrupt artifacts fail closed and leave the live site intact.
        live = json.loads(fetch(LIVE_RECEIPT + '?t=' + str(time.time_ns())))
        artifact_id = str(live['artifact_id'])
    if not re.fullmatch('[0-9]+', artifact_id):
        raise ValueError('Artifact ID must be numeric')
    artifact = api(f'/actions/artifacts/{artifact_id}', token)
    run_id = artifact['workflow_run']['id']
    if not isinstance(run_id, int):
        raise ValueError('Invalid producer run ID')
    for attempt in range(31):
        run = api(f'/actions/runs/{run_id}', token)
        if run.get('status') == 'completed':
            break
        if attempt == 30:
            raise ValueError('Producer completion timed out')
        time.sleep(10)  # Private handoff may arrive before its producer run finishes.
    validate_origin(artifact, run, dry_run)
    if live and any(live.get(k) != value for k, value in {
        'sha': run['head_sha'], 'run_id': run['id'], 'digest': artifact.get('digest')}.items()):
        raise ValueError('Live receipt disagrees with verified artifact')
    receipt = unpack(download(artifact_id, token), artifact, run, '_site/rfl', dry_run)
    print(f"Verified RFL {receipt['sha']}; artifact {receipt['artifact_id']}; Interiors excluded.")
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a') as out:
            out.write(f"RFL commit: `{receipt['sha']}`. Artifact: `{receipt['artifact_id']}`. "
                      f"Artifact expires: `{receipt['expires_at']}`. Interiors excluded.\n")

if __name__ == '__main__':
    main()

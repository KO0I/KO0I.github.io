"""Save and restore exact, successfully deployed Pages artifacts using Releases."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile
import tempfile
import time
import zipfile

WORKFLOW = '.github/workflows/pages-with-rfl.yml'
REQUIRED = {'index.html', 'CNAME', 'rfl/index.html', 'rfl/version.json', 'rfl/deployment.json'}


def gh(*args):
    return subprocess.check_output(['gh', *args])


def api(path):
    return json.loads(gh('api', path))


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def validate_tar(path):
    """Inspect without executing or extracting anything from the deployed site."""
    found = set()
    with tarfile.open(path) as archive:
        for member in archive:
            name = PurePosixPath(member.name)
            if name.is_absolute() or '..' in name.parts:
                raise ValueError('Unsafe archive path')
            if not (member.isfile() or member.isdir()):
                raise ValueError('Links and special files are not allowed')
            if any(p in {'.git', '.github', '.openai'} or p.startswith('.env') for p in name.parts):
                raise ValueError('Private repository/configuration path in Pages archive')
            if member.isfile() and member.size:
                found.add(str(name))
    if not REQUIRED <= found:
        raise ValueError('Incomplete website: ' + ', '.join(sorted(REQUIRED - found)))


def validate_run(run, jobs, repository):
    if (run['path'] != WORKFLOW or run['head_branch'] != 'master'
            or run['head_repository']['full_name'] != repository
            or run['event'] not in {'push', 'workflow_dispatch'}
            or run['status'] != 'completed' or run['conclusion'] != 'success'):
        raise ValueError('Select a successful master Pages workflow run')
    return any(j['name'] == 'deploy' and j['conclusion'] == 'success' for j in jobs)


def summary(text):
    print(text)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as out:
            out.write(text + '\n')


def download_release(repo, tag, directory):
    gh('release', 'download', tag, '--repo', repo, '--dir', str(directory),
       '--pattern', 'artifact.tar', '--pattern', 'sha256.txt')
    expected = (directory / 'sha256.txt').read_text().strip()
    if not re.fullmatch(r'[0-9a-f]{64}', expected) or digest(directory / 'artifact.tar') != expected:
        raise ValueError('Checkpoint checksum mismatch')
    validate_tar(directory / 'artifact.tar')
    return expected


def completed_run(root, run_id):
    for attempt in range(41):
        run = api(f'{root}/actions/runs/{run_id}')
        if run.get('status') == 'completed':
            return run
        if attempt < 40:
            time.sleep(3)
    raise ValueError('Deployment workflow did not finish before checkpoint timeout')


def save(repo, run_id):
    if not re.fullmatch(r'[1-9][0-9]*', run_id):
        raise ValueError('Enter the numeric deployment run ID from its Actions URL')
    root = f'repos/{repo}'
    run = completed_run(root, run_id)
    jobs = api(f'{root}/actions/runs/{run_id}/jobs?filter=latest&per_page=100')['jobs']
    if not validate_run(run, jobs, repo):
        raise ValueError('This run did not deploy Pages (possibly a dry run)')
    tag = f"pages-checkpoint-{run_id}-{run['run_attempt']}"
    # Published releases are never overwritten. Retrying a save verifies and reuses them.
    lookup = subprocess.run(['gh', 'release', 'view', tag, '--repo', repo, '--json', 'isDraft'],
                            capture_output=True, text=True)
    if lookup.returncode == 0 and not json.loads(lookup.stdout)['isDraft']:
        with tempfile.TemporaryDirectory() as tmp:
            download_release(repo, tag, Path(tmp))
        summary(f'Checkpoint already saved: https://github.com/{repo}/releases/tag/{tag}')
        return
    artifacts = api(f'{root}/actions/runs/{run_id}/artifacts?per_page=100')['artifacts']
    matches = [a for a in artifacts if a['name'] == 'github-pages' and not a['expired']]
    if len(matches) != 1:
        raise ValueError('No unique retained github-pages artifact. Cannot reconstruct an expired deployment.')
    with tempfile.TemporaryDirectory() as tmp:
        directory = Path(tmp)
        zip_path = directory / 'download.zip'
        with zip_path.open('wb') as out:
            subprocess.run(['gh', 'api', f"{root}/actions/artifacts/{matches[0]['id']}/zip"],
                           stdout=out, check=True)
        with zipfile.ZipFile(zip_path) as archive:
            if archive.namelist() != ['artifact.tar']:
                raise ValueError('Unexpected Pages artifact container')
            archive.extract('artifact.tar', directory)
        validate_tar(directory / 'artifact.tar')
        (directory / 'sha256.txt').write_text(digest(directory / 'artifact.tar') + '\n')
        if lookup.returncode != 0:
            gh('release', 'create', tag, '--repo', repo, '--target', run['head_sha'],
               '--draft', '--prerelease', '--title', tag,
               '--notes', f"Complete deployed website from {run['html_url']}. Restore using the Restore website checkpoint Action. Deployment success is not visual acceptance.")
        gh('release', 'upload', tag, str(directory / 'artifact.tar'), str(directory / 'sha256.txt'),
           '--repo', repo, '--clobber')
        gh('release', 'edit', tag, '--repo', repo, '--draft=false', '--latest=false')
    summary(f'Saved checkpoint: https://github.com/{repo}/releases/tag/{tag}')


def restore(repo, tag):
    if not re.fullmatch(r'pages-checkpoint-[1-9][0-9]*-[1-9][0-9]*', tag):
        raise ValueError('Select an exact pages-checkpoint-RUN-ATTEMPT release tag')
    release = api(f'repos/{repo}/releases/tags/{tag}')
    if release['draft']:
        raise ValueError('Checkpoint is incomplete (draft)')
    directory = Path('checkpoint')
    directory.mkdir(exist_ok=False)
    checksum = download_release(repo, tag, directory)
    summary(f'Verified {tag}; SHA-256 `{checksum}`. Deployment follows in the deploy job.')


if __name__ == '__main__':
    operation, value = sys.argv[1:]
    repository = os.environ['GITHUB_REPOSITORY']
    if operation == 'save':
        save(repository, value)
    elif operation == 'restore':
        restore(repository, value)
    else:
        raise ValueError('Unknown operation')

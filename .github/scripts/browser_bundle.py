"""Fixed-repository downloads and browser-bundle validation. Execute no payload code."""
import hashlib
import io
import json
from pathlib import PurePosixPath
import re
import stat
import urllib.error
import urllib.parse
import urllib.request
import zipfile

REPO = 'KO0I/rasd-fastwalker-league-js'
REPO_ID = 1388492646
WORKFLOW = '.github/workflows/browser-release.yml'
API = f'https://api.github.com/repos/{REPO}'
LIMIT = 500 * 1024 * 1024
EXTENSIONS = {
    '.js', '.mjs', '.css', '.html', '.svg', '.json',
    '.bin', '.gif', '.png', '.webp', '.woff', '.wasm', '.data',
    '.xpm', '.rnb', '.txt', '.mp3', '.mp4'
}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

def fetch(url, token=None, accept='application/vnd.github+json'):
    headers = {'Accept': accept, 'User-Agent': 'rfl-artifact-receiver',
               'X-GitHub-Api-Version': '2022-11-28', 'Cache-Control': 'no-cache'}
    if token:
        if not (url == API or url.startswith(API + '/')):
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

def download_binary(endpoint, token):
    try:
        return fetch(API + endpoint, token, accept='application/octet-stream')
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

def download(artifact_id, token):
    return download_binary(f'/actions/artifacts/{artifact_id}/zip', token)

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

def inspect_bundle(data, artifact, run, dry_run):
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
                any(not p or p.startswith('.') for p in name.rstrip('/').split('/')) or
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
        return manifest, verified

BUNDLE_NAME = 'browser.zip'
PROVENANCE_NAME = 'provenance.json'
ASSET_NAMES = {BUNDLE_NAME, PROVENANCE_NAME, 'sha256.txt'}


def release_tag(artifact_id):
    if not re.fullmatch(r'[1-9][0-9]*', str(artifact_id)):
        raise ValueError('Artifact ID must be a positive integer')
    return 'browser-artifact-' + str(artifact_id)


def optional_release(artifact_id, token):
    try:
        return api('/releases/tags/' + release_tag(artifact_id), token)
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None
        raise


def verify_preserved(release, artifact_id, token, allow_draft=False):
    tag = release_tag(artifact_id)
    if release.get('tag_name') != tag or (release.get('draft') is not False and not allow_draft):
        raise ValueError('Wrong or incomplete preserved release')
    assets = release.get('assets', [])
    if len(assets) != 3 or {a['name'] for a in assets} != ASSET_NAMES:
        raise ValueError('Preserved release must contain exactly the three archive assets')
    contents = {}
    for asset in assets:
        limit = LIMIT if asset['name'] == BUNDLE_NAME else 1024 * 1024
        if asset.get('state') != 'uploaded' or not 0 < asset.get('size', 0) <= limit:
            raise ValueError('Invalid preserved asset')
        body = download_binary('/releases/assets/' + str(int(asset['id'])), token)
        digest = 'sha256:' + hashlib.sha256(body).hexdigest()
        if len(body) != asset['size'] or asset.get('digest') != digest:
            raise ValueError('Preserved asset digest mismatch')
        contents[asset['name']] = body
    provenance = json.loads(contents[PROVENANCE_NAME])
    if (provenance.get('schema') != 1 or provenance.get('repository') != REPO
            or provenance.get('repository_id') != REPO_ID):
        raise ValueError('Wrong preserved repository provenance')
    artifact, run = provenance['artifact'], provenance['run']
    if str(artifact['id']) != str(artifact_id):
        raise ValueError('Preserved artifact ID mismatch')
    sha = validate_origin(artifact, run, False)
    ref = api('/git/ref/tags/' + tag, token)
    if ref.get('object', {}).get('type') != 'commit' or ref['object']['sha'] != sha:
        raise ValueError('Preserved release tag does not pin its exact producer commit')
    data = contents[BUNDLE_NAME]
    expected = contents['sha256.txt'].decode('ascii').strip()
    if not re.fullmatch(r'[a-f0-9]{64}', expected) or hashlib.sha256(data).hexdigest() != expected:
        raise ValueError('Preserved browser ZIP checksum mismatch')
    inspect_bundle(data, artifact, run, False)
    return artifact, run, data


def load_preserved(artifact_id, token):
    release = optional_release(artifact_id, token)
    if release is None:
        return None
    artifact, run, data = verify_preserved(release, artifact_id, token)
    return artifact, run, data, release['tag_name']


import hashlib
import io
import json
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile
import receive_rfl as receiver

SHA = 'a' * 40

def fixture(name='rfl-release', files=None):
    files = files or {'index.html': b'<html>Flight only</html>', 'app.js': b'const a=1;'}
    manifest = {'schema': 1, 'sha': SHA, 'run_id': '123', 'interiors': False,
                'publish': name == 'rfl-release', 'files': {n: {'sha256': hashlib.sha256(b).hexdigest(), 'size': len(b)} for n, b in files.items()}}
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w') as archive:
        for n, b in files.items(): archive.writestr(n, b)
        archive.writestr('version.json', json.dumps(manifest))
    data = buffer.getvalue()
    artifact = {'id': 456, 'name': name, 'expired': False, 'size_in_bytes': len(data),
                'digest': 'sha256:' + hashlib.sha256(data).hexdigest(), 'expires_at': '2027-01-01T00:00:00Z',
                'workflow_run': {'id': 123, 'repository_id': receiver.REPO_ID, 'head_repository_id': receiver.REPO_ID, 'head_sha': SHA, 'head_branch': 'main'}}
    run = {'id': 123, 'path': receiver.WORKFLOW, 'event': 'workflow_dispatch', 'status': 'completed', 'conclusion': 'success', 'head_sha': SHA, 'head_branch': 'main'}
    return data, artifact, run

class ReceiverTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.output = Path(self.temp.name) / 'rfl'

    def unpack(self, values, dry=False):
        return receiver.unpack(*values, self.output, dry)

    def test_valid_release_and_receipt(self):
        receipt = self.unpack(fixture())
        self.assertEqual(receipt['sha'], SHA)
        self.assertEqual(receipt['artifact_id'], 456)
        self.assertTrue((self.output / 'deployment.json').is_file())

    def test_preview_never_promotes(self):
        with self.assertRaises(ValueError): self.unpack(fixture('rfl-preview'))
        self.unpack(fixture('rfl-preview'), dry=True)

    def test_wrong_origin_variants(self):
        for field, value in [('head_branch', 'feature'), ('path', 'other.yml'), ('event', 'pull_request'),
                             ('conclusion', 'failure'), ('status', 'in_progress'), ('head_sha', 'b'*40), ('id', 999)]:
            with self.subTest(field=field):
                data, artifact, run = fixture(); run[field] = value
                with self.assertRaises(ValueError): self.unpack((data, artifact, run))

    def test_fork_expired_and_digest(self):
        for kind in ('fork', 'expired', 'digest'):
            data, artifact, run = fixture()
            if kind == 'fork': artifact['workflow_run']['head_repository_id'] = 999
            if kind == 'expired': artifact['expired'] = True
            if kind == 'digest': artifact['digest'] = 'sha256:' + '0'*64
            with self.assertRaises(ValueError): self.unpack((data, artifact, run))

    def test_forbidden_paths(self):
        for name in ('../escape.js', '/absolute.js', '.git/config', 'app.js.map', 'src/source.ts', 'interior.js', 'a\\b.js'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.unpack(fixture(files={'index.html': b'ok', name: b'bad'}))

    def test_maps_and_interior_markup(self):
        for content in (b'//# sourceMappingURL=x', b'{"sourcesContent":[]}', b'<section id="shipInterior">'):
            with self.assertRaises(ValueError): self.unpack(fixture(files={'index.html': content}))

    def test_tamper_does_not_replace_existing_site(self):
        self.output.mkdir(); (self.output / 'index.html').write_text('previous release')
        data, artifact, run = fixture()
        buffer = io.BytesIO()
        with zipfile.ZipFile(io.BytesIO(data)) as original, zipfile.ZipFile(buffer, 'w') as modified:
            for entry in original.infolist():
                modified.writestr(entry, b'tampered' if entry.filename == 'app.js' else original.read(entry))
        data = buffer.getvalue(); artifact['digest'] = 'sha256:' + hashlib.sha256(data).hexdigest()
        with self.assertRaises(ValueError): self.unpack((data, artifact, run))
        self.assertEqual((self.output / 'index.html').read_text(), 'previous release')

    def test_unmanifested_file_and_symlink(self):
        for symlink in (False, True):
            data, artifact, run = fixture(); buffer = io.BytesIO(data)
            with zipfile.ZipFile(buffer, 'a') as archive:
                if symlink:
                    entry = zipfile.ZipInfo('link.js'); entry.external_attr = (stat.S_IFLNK | 0o777) << 16
                    archive.writestr(entry, 'app.js')
                else: archive.writestr('extra.js', 'unlisted')
            data = buffer.getvalue(); artifact['digest'] = 'sha256:' + hashlib.sha256(data).hexdigest()
            with self.assertRaises(ValueError): self.unpack((data, artifact, run))

    def test_token_cannot_leave_fixed_api(self):
        with self.assertRaises(ValueError): receiver.fetch('https://example.com/steal', 'token')

    def test_live_receipt_pins_existing_deployment(self):
        data, artifact, run = fixture()
        receipt = {'artifact_id': 456, 'sha': SHA, 'run_id': 123, 'digest': artifact['digest']}
        with patch.dict('os.environ', {'RFL_ARTIFACTS_TOKEN': 'test', 'RFL_ARTIFACT_ID': '', 'RFL_DRY_RUN': 'true'}), \
             patch.object(receiver, 'fetch', return_value=json.dumps(receipt).encode()) as fetch, \
             patch.object(receiver, 'api', side_effect=[artifact, run]) as api, \
             patch.object(receiver, 'download', return_value=data), \
             patch.object(receiver, 'unpack', return_value={**receipt, 'expires_at': artifact['expires_at']}):
            receiver.main()
            self.assertTrue(fetch.call_args.args[0].startswith(receiver.LIVE_RECEIPT + '?t='))
            self.assertEqual(api.call_args_list[0].args[0], '/actions/artifacts/456')

if __name__ == '__main__': unittest.main()

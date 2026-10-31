import copy
import hashlib
import io
import json
import unittest
from unittest.mock import patch
import zipfile

import browser_bundle as bundle

SHA = 'a' * 40


def fixture():
    files = {'index.html': b'<html>Flight only</html>', 'app.js': b'const a=1;'}
    manifest = {'schema': 1, 'sha': SHA, 'run_id': '123', 'publish': True, 'interiors': False,
                'site_handoff': True,
                'files': {n: {'sha256': hashlib.sha256(b).hexdigest(), 'size': len(b)} for n, b in files.items()}}
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w') as archive:
        for name, body in files.items():
            archive.writestr(name, body)
        archive.writestr('version.json', json.dumps(manifest))
    data = buffer.getvalue()
    artifact = {'id': 456, 'name': 'rfl-release', 'expired': False, 'size_in_bytes': len(data),
                'digest': 'sha256:' + hashlib.sha256(data).hexdigest(), 'expires_at': '2000-01-01T00:00:00Z',
                'workflow_run': {'id': 123, 'repository_id': bundle.REPO_ID,
                                 'head_repository_id': bundle.REPO_ID, 'head_sha': SHA, 'head_branch': 'main'}}
    run = {'id': 123, 'path': bundle.WORKFLOW, 'event': 'workflow_dispatch', 'head_branch': 'main',
           'head_sha': SHA, 'status': 'completed', 'conclusion': 'success', 'run_attempt': 1}
    provenance = {'schema': 1, 'repository': bundle.REPO, 'repository_id': bundle.REPO_ID,
                  'artifact': artifact, 'run': run}
    bodies = {'browser.zip': data, 'provenance.json': json.dumps(provenance).encode(),
              'sha256.txt': (hashlib.sha256(data).hexdigest() + '\n').encode()}
    release = {'id': 789, 'tag_name': 'browser-artifact-456', 'draft': False, 'assets': []}
    for index, (name, body) in enumerate(bodies.items(), 1):
        release['assets'].append(asset(index, name, body))
    return release, bodies, artifact, run


def asset(index, name, body):
    return {'id': index, 'name': name, 'size': len(body), 'state': 'uploaded',
            'digest': 'sha256:' + hashlib.sha256(body).hexdigest()}


class PreservedBundleTests(unittest.TestCase):
    def setUp(self):
        self.release, self.bodies, self.artifact, self.run = fixture()

    def download(self, endpoint, token):
        key = int(endpoint.rsplit('/', 1)[1])
        name = next(a['name'] for a in self.release['assets'] if a['id'] == key)
        return self.bodies[name]

    def verify(self):
        ref = {'object': {'type': 'commit', 'sha': SHA}}
        with patch.object(bundle, 'api', return_value=ref), patch.object(bundle, 'download_binary', side_effect=self.download):
            return bundle.verify_preserved(self.release, '456', 'test')

    def replace(self, name, body):
        self.bodies[name] = body
        entry = next(a for a in self.release['assets'] if a['name'] == name)
        entry.update(asset(entry['id'], name, body))

    def test_restore_after_actions_expiry_needs_no_actions_metadata(self):
        ref = {'object': {'type': 'commit', 'sha': SHA}}
        with patch.object(bundle, 'api', side_effect=[self.release, ref]) as api, \
             patch.object(bundle, 'download_binary', side_effect=self.download):
            restored = bundle.load_preserved('456', 'test')
        self.assertEqual(restored[2], self.bodies['browser.zip'])
        self.assertEqual(restored[3], 'browser-artifact-456')
        self.assertEqual(len(api.call_args_list), 2)
        self.assertFalse(any('/actions/' in c.args[0] for c in api.call_args_list))

    def test_wrong_tag_draft_missing_and_duplicate_assets_fail(self):
        original = copy.deepcopy(self.release)
        for kind in ('tag', 'draft', 'missing', 'duplicate'):
            self.release = copy.deepcopy(original)
            if kind == 'tag': self.release['tag_name'] = 'other'
            if kind == 'draft': self.release['draft'] = True
            if kind == 'missing': self.release['assets'].pop()
            if kind == 'duplicate': self.release['assets'][1]['name'] = 'browser.zip'
            with self.subTest(kind=kind), self.assertRaises(ValueError): self.verify()

    def test_moved_tag_is_rejected(self):
        with patch.object(bundle, 'api', return_value={'object': {'type': 'commit', 'sha': 'b'*40}}), \
             patch.object(bundle, 'download_binary', side_effect=self.download):
            with self.assertRaisesRegex(ValueError, 'exact producer commit'):
                bundle.verify_preserved(self.release, '456', 'test')

    def test_asset_digest_and_zip_checksum_are_both_required(self):
        self.bodies['browser.zip'] += b'tamper'
        with self.assertRaisesRegex(ValueError, 'digest mismatch'): self.verify()
        self.release, self.bodies, self.artifact, self.run = fixture()
        self.replace('sha256.txt', ('0'*64 + '\n').encode())
        with self.assertRaisesRegex(ValueError, 'checksum mismatch'): self.verify()

    def test_saved_origin_must_be_successful_production_from_fixed_repository(self):
        original = self.bodies['provenance.json']
        for kind in ('failed', 'preview', 'fork', 'wrong-id', 'repository'):
            p = json.loads(original)
            if kind == 'failed': p['run']['conclusion'] = 'failure'
            if kind == 'preview': p['artifact']['name'] = 'rfl-preview'
            if kind == 'fork': p['artifact']['workflow_run']['head_repository_id'] = 999
            if kind == 'wrong-id': p['artifact']['id'] = 999
            if kind == 'repository': p['repository'] = 'someone/else'
            self.replace('provenance.json', json.dumps(p).encode())
            with self.subTest(kind=kind), self.assertRaises(ValueError): self.verify()

    def test_manifest_payload_hashes_are_rechecked_after_archiving(self):
        source = io.BytesIO(self.bodies['browser.zip'])
        out = io.BytesIO()
        with zipfile.ZipFile(source) as src, zipfile.ZipFile(out, 'w') as dst:
            for entry in src.infolist():
                dst.writestr(entry, b'changed' if entry.filename == 'app.js' else src.read(entry))
        data = out.getvalue()
        p = json.loads(self.bodies['provenance.json'])
        p['artifact']['digest'] = 'sha256:' + hashlib.sha256(data).hexdigest()
        self.replace('provenance.json', json.dumps(p).encode())
        self.replace('browser.zip', data)
        self.replace('sha256.txt', (hashlib.sha256(data).hexdigest() + '\n').encode())
        with self.assertRaisesRegex(ValueError, 'File checksum mismatch'): self.verify()

    def test_id_is_numeric_and_credential_cannot_leave_fixed_repository(self):
        for value in ('latest', '../1', '0', '1?x=y'):
            with self.assertRaises(ValueError): bundle.release_tag(value)
        with self.assertRaises(ValueError): bundle.fetch('https://example.com', 'secret')

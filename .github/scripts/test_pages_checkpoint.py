import copy
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

import pages_checkpoint as pc


class CheckpointTests(unittest.TestCase):
    def make_tar(self, directory, extra=None, omit=None):
        dest = Path(directory) / 'artifact.tar'
        with tarfile.open(dest, 'w') as archive:
            for name in sorted(pc.REQUIRED - set(omit or [])):
                info = tarfile.TarInfo('./' + name)
                info.size = 2
                archive.addfile(info, io.BytesIO(b'OK'))
            if extra:
                archive.addfile(extra)
        return dest

    def test_whole_site_and_hash_roundtrip(self):
        with tempfile.TemporaryDirectory() as tmp:
            dest = self.make_tar(tmp)
            pc.validate_tar(dest)
            (Path(tmp) / 'sha256.txt').write_text(pc.digest(dest))
            with patch.object(pc, 'gh'):
                self.assertEqual(pc.download_release('a/b', 'tag', Path(tmp)), pc.digest(dest))
                dest.write_bytes(b'corrupted')
                with self.assertRaisesRegex(ValueError, 'checksum'):
                    pc.download_release('a/b', 'tag', Path(tmp))

    def test_reject_missing_game(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(ValueError, 'Incomplete'):
                pc.validate_tar(self.make_tar(tmp, omit=['rfl/index.html']))

    def test_reject_unsafe_archives(self):
        for name in ['../escape', '/absolute', '.git/config', '.openai/hosting.json', '.env.local']:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as tmp:
                with self.assertRaises(ValueError):
                    pc.validate_tar(self.make_tar(tmp, tarfile.TarInfo(name)))
        with tempfile.TemporaryDirectory() as tmp:
            link = tarfile.TarInfo('link')
            link.type = tarfile.SYMTYPE
            link.linkname = '/etc/passwd'
            with self.assertRaisesRegex(ValueError, 'Links'):
                pc.validate_tar(self.make_tar(tmp, link))

    def test_only_successful_production_deployments(self):
        run = dict(path=pc.WORKFLOW, head_branch='master', head_repository={'full_name': 'a/b'},
                   event='push', status='completed', conclusion='success')
        jobs = [{'name': 'deploy', 'conclusion': 'success'}]
        self.assertTrue(pc.validate_run(run, jobs, 'a/b'))
        self.assertFalse(pc.validate_run(run, [], 'a/b'))
        for field, value in [('head_branch', 'feature'), ('event', 'pull_request'),
                             ('conclusion', 'failure'), ('path', 'other.yml'),
                             ('head_repository', {'full_name': 'fork/b'})]:
            changed = copy.deepcopy(run)
            changed[field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                pc.validate_run(changed, jobs, 'a/b')

    def test_user_input_is_not_a_ref_or_command(self):
        with self.assertRaises(ValueError):
            pc.save('a/b', '--help')
        for tag in ['latest', '../x', 'pages-checkpoint-1-1;echo bad']:
            with self.subTest(tag=tag), self.assertRaises(ValueError):
                pc.restore('a/b', tag)


if __name__ == '__main__':
    unittest.main()

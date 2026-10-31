import contextlib
import copy
import io
import json
from pathlib import Path
import tempfile
import unittest

import reconcile_sources as reconcile


class ReconciliationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.config = {'schema': 1, 'component': 'plants', 'mode': 'monorepo-first',
                       'adapter': {'path': 'test-fixture-identity', 'revision': 'fixture-v1'},
                       'baseline_record_url': 'https://example.invalid/verified-fixture',
                       'sides': {}, 'paths': []}
        for side in ('sites', 'monorepo', 'mirror'):
            self.config['sides'][side] = {'current': side + '/current', 'baseline': side + '/base',
                                          'source': 'fixture:' + side,
                                          'head': side + '-current', 'baseline_head': side + '-base', 'complete': True}
            for stage in ('current', 'base'):
                (self.root / side / stage).mkdir(parents=True)
        self.add('species.js', b'original species')
        self.add('preview.js', b'original preview')

    def add(self, name, data=None):
        self.config['paths'].append({'id': name, **{s: name for s in self.config['sides']}})
        if data is not None:
            for side in self.config['sides']:
                for stage in ('base', 'current'):
                    self.write(side, name, data, stage)

    def write(self, side, name, data, stage='current'):
        p = self.root / side / stage / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data)

    def compare(self):
        return reconcile.compare(self.config, self.root)

    def item(self, plan, name):
        return next(i for i in plan['items'] if i['id'] == name)

    def test_both_modes_preserve_unpublished_sites_work_and_combine_disjoint_changes(self):
        self.write('sites', 'preview.js', b'unpublished orbit controls')
        self.write('monorepo', 'species.js', b'new species')
        self.write('sites', 'draft-not-mapped.txt', b'unfinished private notes')
        for mode in ('sites-first', 'monorepo-first'):
            self.config['mode'] = mode
            plan = self.compare()
            self.assertEqual(plan['status'], 'ready')
            self.assertEqual(self.item(plan, 'preview.js')['content_sources'], ['sites'])
            self.assertEqual(set(self.item(plan, 'preview.js')['writes']), {'monorepo', 'mirror'})
            self.assertEqual(self.item(plan, 'species.js')['content_sources'], ['monorepo'])
            self.assertEqual(set(self.item(plan, 'species.js')['writes']), {'sites', 'mirror'})
            self.assertFalse(plan['writes_authorized'])
            self.assertEqual((self.root / 'sites/current/draft-not-mapped.txt').read_bytes(), b'unfinished private notes')
            self.assertEqual((self.root / 'sites/current/species.js').read_bytes(), b'original species')

    def test_overlapping_edits_block_in_either_mode(self):
        self.write('sites', 'species.js', b'Sites edit')
        self.write('monorepo', 'species.js', b'monorepo edit')
        for mode in ('sites-first', 'monorepo-first'):
            self.config['mode'] = mode
            plan = self.compare()
            self.assertEqual(plan['status'], 'blocked')
            self.assertEqual(self.item(plan, 'species.js')['writes'], {})

    def test_identical_edits_converge(self):
        for side in ('sites', 'monorepo'):
            self.write(side, 'species.js', b'same edit')
        plan = self.compare()
        self.assertEqual(plan['status'], 'ready')
        self.assertEqual(set(self.item(plan, 'species.js')['writes']), {'mirror'})

    def test_mirror_independent_edits_are_included(self):
        self.write('mirror', 'species.js', b'independent mirror change')
        plan = self.compare()
        self.assertEqual(self.item(plan, 'species.js')['content_sources'], ['mirror'])
        self.assertEqual(set(self.item(plan, 'species.js')['writes']), {'sites', 'monorepo'})

    def test_delete_edit_conflict_and_uncontested_deletion(self):
        (self.root / 'sites/current/species.js').unlink()
        plan = self.compare()
        self.assertEqual(self.item(plan, 'species.js')['writes']['monorepo']['operation'], 'delete')
        self.write('monorepo', 'species.js', b'new work')
        self.assertEqual(self.compare()['status'], 'blocked')

    def test_add_delete_blocks_possible_rename(self):
        self.add('renamed.js')
        (self.root / 'sites/current/species.js').unlink()
        self.write('sites', 'renamed.js', b'renamed and edited species')
        plan = self.compare()
        self.assertIn('add_delete_requires_rename_review', [c['reason'] for c in plan['conflicts']])
        review = next(c for c in plan['conflicts'] if c['reason'] == 'add_delete_requires_rename_review')
        self.config['add_delete_review'] = {'changes_sha256': review['review_sha256'],
                                            'evidence_url': 'https://example.invalid/fixture-rename-review'}
        self.assertEqual(self.compare()['status'], 'ready')
        self.write('sites', 'renamed.js', b'unreviewed newer edit')
        self.assertEqual(self.compare()['status'], 'blocked')

    def test_unknown_baseline_only_proposes_equivalence(self):
        for side in self.config['sides'].values():
            del side['baseline']
            del side['baseline_head']
        self.assertEqual(self.compare()['status'], 'baseline_candidate')
        self.write('sites', 'species.js', b'unknown edit')
        self.assertEqual(self.compare()['status'], 'blocked')

    def test_add_delete_across_sides_also_requires_rename_review(self):
        self.add('new-species.js')
        (self.root / 'sites/current/species.js').unlink()
        self.write('monorepo', 'new-species.js', b'potential rename with modifications')
        self.assertIn('add_delete_requires_rename_review', [c['reason'] for c in self.compare()['conflicts']])

    def test_different_or_partial_baselines_block(self):
        self.write('sites', 'species.js', b'wrong baseline', 'base')
        self.assertEqual(self.compare()['status'], 'blocked')
        del self.config['sides']['sites']['baseline']
        with self.assertRaises(ValueError): self.compare()

    def test_empty_or_incomplete_snapshots_do_not_prove_baseline(self):
        for side in self.config['sides'].values():
            del side['baseline']
        for side in self.config['sides']:
            (self.root / side / 'current/species.js').unlink()
        self.assertEqual(self.compare()['status'], 'blocked')
        self.config['sides']['sites']['complete'] = False
        with self.assertRaises(ValueError): self.compare()

    def test_path_mapping_and_binary_hashes(self):
        self.add('seed.bin', b'\x00\xff\x01')
        mapping = self.config['paths'][-1]
        mapping['monorepo'] = 'domain/seed.bin'
        for stage in ('base', 'current'):
            p = self.root / 'monorepo' / stage
            (p / 'domain').mkdir()
            (p / 'seed.bin').rename(p / 'domain/seed.bin')
        self.write('sites', 'seed.bin', b'\x00\xfe\x01')
        plan = self.compare()
        self.assertEqual(self.item(plan, 'seed.bin')['writes']['monorepo']['path'], 'domain/seed.bin')

    def test_unsafe_duplicate_and_symlink_paths_rejected(self):
        original = copy.deepcopy(self.config)
        for bad in ('../secret', '/absolute', 'a/../b', 'a\\b', './species.js'):
            self.config = copy.deepcopy(original)
            self.config['paths'][0]['sites'] = bad
            with self.assertRaises(ValueError): self.compare()
        self.config = copy.deepcopy(original)
        self.config['paths'][1]['sites'] = 'species.js'
        with self.assertRaises(ValueError): self.compare()
        self.config = original
        path = self.root / 'sites/current/species.js'
        path.unlink()
        path.symlink_to(self.root / 'sites/base/species.js')
        with self.assertRaises(ValueError): self.compare()

    def test_missing_adapter_or_source_head_rejected(self):
        original = copy.deepcopy(self.config)
        for path, key in [('adapter', 'revision'), ('sides', 'sites')]:
            self.config = copy.deepcopy(original)
            if path == 'adapter': del self.config[path][key]
            else: del self.config[path][key]['head']
            with self.assertRaises(ValueError): self.compare()

    def test_fresh_check_rejects_head_content_and_adapter_changes(self):
        inventory = self.root / 'inventory.json'
        saved = self.root / 'plan.json'
        saved.write_text(json.dumps(self.compare()))
        def run():
            inventory.write_text(json.dumps(self.config))
            with contextlib.redirect_stdout(io.StringIO()) as out:
                code = reconcile.main([str(inventory), '--expect-plan', str(saved)])
            return code, json.loads(out.getvalue())
        self.assertEqual(run()[0], 0)
        self.config['sides']['sites']['head'] = 'advanced-head'
        code, plan = run()
        self.assertEqual((code, plan['status']), (2, 'stale'))
        self.config['sides']['sites']['head'] = 'sites-current'
        self.write('sites', 'species.js', b'changed without reported head change')
        self.assertEqual(run()[1]['status'], 'stale')
        self.write('sites', 'species.js', b'original species')
        self.config['adapter']['revision'] = 'new-adapter'
        self.assertEqual(run()[1]['status'], 'stale')
        self.config['adapter']['revision'] = 'fixture-v1'
        self.config['sides']['sites']['source'] = 'different-site'
        self.assertEqual(run()[1]['status'], 'stale')
        self.config['sides']['sites']['source'] = 'fixture:sites'
        self.config['paths'][0]['id'] = 'changed-mapping'
        self.assertEqual(run()[1]['status'], 'stale')

    def test_rerun_is_deterministic_and_tampered_plan_is_rejected(self):
        self.assertEqual(self.compare(), self.compare())
        saved = self.root / 'plan.json'
        plan = self.compare()
        plan['observed_heads']['sites']['current'] = 'tampered'
        saved.write_text(json.dumps(plan))
        inventory = self.root / 'inventory.json'
        inventory.write_text(json.dumps(self.config))
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(reconcile.main([str(inventory), '--expect-plan', str(saved)]), 1)


if __name__ == '__main__':
    unittest.main()

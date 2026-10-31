"""Read-only comparison of explicitly mapped, canonical source snapshots."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import sys


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def relative_path(value):
    if not isinstance(value, str) or not value or '\\' in value:
        raise ValueError('Mapped paths must be nonempty relative POSIX paths')
    path = PurePosixPath(value)
    if path.is_absolute() or any(p in ('', '.', '..') for p in value.split('/')):
        raise ValueError('Unsafe mapped path: ' + value)
    return path


def file_hash(root, name):
    path = root
    for part in relative_path(name).parts:
        path = path / part
        if path.is_symlink():
            raise ValueError('Symlinks are not allowed in mapped snapshots')
    if not path.exists():
        return None
    if not path.is_file():
        raise ValueError('Mapped paths must be regular files: ' + name)
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def snapshot_root(directory, value):
    if not isinstance(value, str) or not value:
        raise ValueError('Snapshot directory is required')
    root = directory / value
    # Check ancestors before resolving so symlinks cannot hide incomplete exports.
    if any(p.is_symlink() for p in (root, *root.parents)) or not root.is_dir():
        raise ValueError('Snapshot directory is missing or contains a symlink')
    return root.resolve()


def compare(config, directory):
    if not isinstance(config, dict) or config.get('schema') != 1 or config.get('mode') not in ('sites-first', 'monorepo-first'):
        raise ValueError('Expected schema 1 and an explicit entry mode')
    if not isinstance(config.get('component'), str) or not config['component']:
        raise ValueError('Component is required')
    adapter = config.get('adapter', {})
    if not isinstance(adapter, dict) or not all(isinstance(adapter.get(k), str) and adapter[k] for k in ('path', 'revision')):
        raise ValueError('Record the canonicalization adapter path and revision')
    sides = config.get('sides', {})
    if not isinstance(sides, dict) or not {'sites', 'monorepo'} <= sides.keys() or not sides.keys() <= {'sites', 'monorepo', 'mirror'}:
        raise ValueError('Select sites, monorepo, and optionally mirror')
    if not all(isinstance(side, dict) for side in sides.values()):
        raise ValueError('Each side must describe a source snapshot')
    paths = config.get('paths')
    if not isinstance(paths, list) or not paths:
        raise ValueError('An explicit nonempty file mapping is required')
    known = [bool(s.get('baseline')) for s in sides.values()]
    if any(known) and not all(known):
        raise ValueError('Baseline snapshots are required for every selected side, or none')
    has_baseline = all(known)
    if has_baseline and not config.get('baseline_record_url'):
        raise ValueError('A verified baseline record URL is required')
    roots = {}
    heads = {}
    for name, side in sorted(sides.items()):
        if side.get('complete') is not True or not all(isinstance(side.get(k), str) and side[k] for k in ('source', 'head')):
            raise ValueError('Each snapshot needs a source identity, source head, and complete=true')
        if has_baseline and not (isinstance(side.get('baseline_head'), str) and side['baseline_head']):
            raise ValueError('Each baseline needs its source head')
        roots[name] = {'current': snapshot_root(directory, side['current'])}
        if has_baseline:
            roots[name]['baseline'] = snapshot_root(directory, side['baseline'])
        heads[name] = {'source': side['source'], 'current': side['head'], 'baseline': side.get('baseline_head')}
    seen_ids = set()
    seen_paths = {name: set() for name in sides}
    items = []
    conflicts = []
    for mapping in paths:
        if not isinstance(mapping, dict):
            raise ValueError('Each file mapping must be an object')
        key = mapping.get('id')
        if not isinstance(key, str) or not key or key in seen_ids:
            raise ValueError('Each mapped file needs a unique id')
        seen_ids.add(key)
        if set(mapping) != set(sides) | {'id'}:
            raise ValueError('Every file must map exactly the selected sides')
        observed = {}
        for name in sorted(sides):
            path = str(relative_path(mapping[name]))
            if path in seen_paths[name]:
                raise ValueError('Two file ids map to the same destination path')
            seen_paths[name].add(path)
            observed[name] = {'path': path, 'current': file_hash(roots[name]['current'], path)}
            if has_baseline:
                observed[name]['baseline'] = file_hash(roots[name]['baseline'], path)
        values = {s['current'] for s in observed.values()}
        item = {'id': key, 'sides': observed, 'writes': {}}
        if not has_baseline:
            if len(values) != 1:
                conflicts.append({'id': key, 'reason': 'unknown_baseline_with_different_content'})
            elif values == {None}:
                conflicts.append({'id': key, 'reason': 'mapped_file_missing_everywhere'})
        else:
            bases = {s['baseline'] for s in observed.values()}
            if len(bases) != 1:
                conflicts.append({'id': key, 'reason': 'baseline_content_not_equivalent'})
            else:
                base = next(iter(bases))
                changes = {s['current'] for s in observed.values() if s['current'] != base}
                if len(changes) > 1:
                    conflicts.append({'id': key, 'reason': 'overlapping_changes_or_delete_edit'})
                else:
                    result = next(iter(changes)) if changes else base
                    item['result_sha256'] = result
                    item['content_sources'] = sorted(n for n, s in observed.items() if s['current'] == result)
                    for name, state in observed.items():
                        if state['current'] != result:
                            item['writes'][name] = {'path': state['path'], 'before_sha256': state['current'],
                                                   'after_sha256': result,
                                                   'operation': 'delete' if result is None else 'add' if state['current'] is None else 'modify'}
        items.append(item)
    # File hashes cannot distinguish a rename from independent add/delete edits.
    if has_baseline:
        all_adds = []
        all_deletes = []
        for name in sorted(sides):
            adds = [i['id'] for i in items if i['sides'][name]['baseline'] is None and i['sides'][name]['current'] is not None]
            deletes = [i['id'] for i in items if i['sides'][name]['baseline'] is not None and i['sides'][name]['current'] is None]
            all_adds.extend({'side': name, 'id': key} for key in adds)
            all_deletes.extend({'side': name, 'id': key} for key in deletes)
        if all_adds and all_deletes:
            review_sha = fingerprint(sorted(items, key=lambda i: i['id']))
            review = config.get('add_delete_review', {})
            if not (isinstance(review, dict) and review.get('changes_sha256') == review_sha
                    and isinstance(review.get('evidence_url'), str) and review['evidence_url']):
                conflicts.append({'reason': 'add_delete_requires_rename_review', 'adds': all_adds,
                                  'deletes': all_deletes, 'review_sha256': review_sha})
    plan = {'schema': 1, 'component': config['component'], 'mode': config['mode'], 'adapter': adapter,
            'baseline_record_url': config.get('baseline_record_url'), 'observed_heads': heads,
            'status': 'blocked' if conflicts else 'ready' if has_baseline else 'baseline_candidate',
            'items': sorted(items, key=lambda i: i['id']), 'conflicts': conflicts,
            'add_delete_review': config.get('add_delete_review'),
            'unmapped_paths': 'preserve; not inspected by this planner', 'writes_authorized': False}
    plan['plan_sha256'] = fingerprint(plan)
    return plan


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inventory', type=Path)
    parser.add_argument('--expect-plan', type=Path, help='Re-read fresh snapshots and reject any change since this plan')
    args = parser.parse_args(argv)
    try:
        config = json.loads(args.inventory.read_text())
        plan = compare(config, args.inventory.resolve().parent)
        if args.expect_plan:
            expected = json.loads(args.expect_plan.read_text())
            claimed = expected.pop('plan_sha256')
            if fingerprint(expected) != claimed:
                raise ValueError('Expected plan checksum is invalid')
            if plan['plan_sha256'] != claimed:
                plan['status'] = 'stale'
                plan['conflicts'].append({'reason': 'heads_mapping_adapter_or_content_changed'})
                plan['plan_sha256'] = fingerprint({k: v for k, v in plan.items() if k != 'plan_sha256'})
        print(json.dumps(plan, indent=2, sort_keys=True))
        return 0 if plan['status'] == 'ready' else 2
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(json.dumps({'status': 'invalid', 'error': str(error), 'writes_authorized': False}), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())

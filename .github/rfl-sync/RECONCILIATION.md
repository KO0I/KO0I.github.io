# Reconcile editable sources before writing

Use `.github/scripts/reconcile_sources.py` to compare explicitly mapped files from immutable local snapshots. The command reads files and prints hashes, conflicts, and proposed per-destination operations. It never copies files, pushes commits, publishes Sites, or calls external services.

## Freeze the evidence

1. Select the component, entry mode, and destinations. Include a component mirror if this run can overwrite it. Both modes use the same comparison rules.
2. Read each Site's **editable source**, including unpublished work, through the Sites skill. Read exact monorepo and mirror commits. Record source identities and exact heads separately from deployed Site versions.
3. Find the last verified synchronized source pair or triple. Retrieve those exact baseline snapshots and their evidence record. Do not substitute a deployed Site version, upstream branch tip, or approximate date.
4. Run a reviewed adapter to prepare canonical baseline and current snapshots outside live repositories. Record its path and exact revision. Canonicalization must account for intentional layout and import differences without dropping editable content. An import adapter is not evidence of a working export adapter.
5. Inventory every file within the selected synchronization scope. List explicit per-side paths for each canonical file. Map deletions as missing files inside a complete snapshot. Classify excluded files and destination-only files separately and preserve them. Include untracked or newly saved editable files in the inventory. Never infer a deletion from an incomplete export.

Keep live inventories, exported source, reports, and source-level diffs in private storage appropriate to their content. The public website repository may contain this tool, synthetic tests, and sanitized checkpoint evidence. Do not upload private source, sensitive paths, credentials, or signed URLs to public CI or release records.

## Prepare an inventory and compare

Copy `inventory-template.json` to a private working directory. Replace the null fields with verified evidence and list all selected files. Snapshot directories are relative to the inventory file, or absolute local paths. Keep snapshots immutable while the comparison runs.

The inventory contains:

| Field | Required evidence |
| --- | --- |
| `component`, `mode` | Selected component and `sites-first` or `monorepo-first` |
| `adapter.path`, `adapter.revision` | Reviewed canonicalization adapter and exact revision |
| `baseline_record_url` | Record proving the baseline contents were synchronized |
| `sides` | `sites` and `monorepo`, plus `mirror` when selected |
| Each side's `source`, `head`, `current`, `complete` | Exact Site project ID or repository identity, editable-source revision, current snapshot directory, and confirmation that the scope was completely exported |
| Each side's `baseline_head`, `baseline` | Exact synchronized source revision and baseline snapshot directory |
| `paths` | Unique canonical file ID and explicit path for every selected side |

The tool checks mapped file bytes with SHA-256. It does not verify remote identities, adapter correctness, file permissions, or the completeness assertion. Verify those at capture and patch-validation time. Unmapped paths remain outside the plan and must be preserved.

Run these commands from the website repository checkout. Use private absolute paths in place of the placeholders:

```sh
python3 .github/scripts/reconcile_sources.py /private/run/inventory.json > /private/run/plan.json
```

| Status | Exit code | Next action |
| --- | --- | --- |
| `ready` | 0 | Review the proposed operations and stage a candidate outside live destinations |
| `blocked` | 2 | Resolve conflicting files and their dependents, then capture and compare again |
| `baseline_candidate` | 2 | No baseline was supplied; current mapped bytes match, but evidence still requires review |
| `stale` | 2 | The fresh comparison differs from the saved plan; reconcile again |
| `invalid` | 1 | Correct missing evidence, unsafe paths, or malformed input |

Without a baseline, omit `baseline` and `baseline_head` from **every** side. The tool proposes a baseline only when each mapped file exists and agrees across selected sides. Verify the mapping, exclusions, source history, and adapter before recording that baseline. Then capture the verified baseline snapshots and run again. Never label a baseline candidate synchronized automatically.

Different edits to one mapped file, including deletion versus modification, block the plan. Identical edits converge. Changes to different mapped files combine, regardless of entry mode. Any combination of additions and deletions triggers conservative rename review, including changes across sides. The tool does not perform line merges or resolve renames. Keep such plans blocked until the mapping and changes are explicitly resolved and validated in a new candidate.

For intentional additions and deletions, review the complete patch and record whether files were renamed or changed independently. Update mappings if needed, then rerun. Record `add_delete_review` in the inventory with `changes_sha256` set to the report conflict's `review_sha256` and `evidence_url` pointing to that review. The acknowledgment binds the exact mapped hashes and proposed operations. Any subsequent content or mapping change requires another review. This acknowledgment cannot clear overlapping-content or baseline conflicts.

Treat the whole selected component as blocked when its report contains conflicts. `writes` on nonconflicting items are diagnostic proposals, not permission for a partial application. Independent components can continue with separate inventories and checkpoints.

## Recheck immediately before every write

1. Build and validate the translated candidate outside live destinations. Review its complete patch, file modes, explicit deletions, and preserved files. Confirm that the destination export adapter is implemented and tested.
2. Re-read **all selected source and destination heads** from their services. Capture fresh complete current snapshots, including unpublished Sites work, and update the inventory. Reusing old local snapshots does not constitute a fresh check.
3. Compare the fresh snapshots against the reviewed report:

```sh
python3 .github/scripts/reconcile_sources.py /private/run/fresh-inventory.json --expect-plan /private/run/plan.json
```

4. Proceed only if the report is `ready` and its plan checksum is unchanged. Any head, mapping, adapter, or mapped-content change invalidates the candidate. A checksum binds the report contents; it is not a signature or proof of remote state.
5. Apply only the reviewed destination patch using an expected-head write or equivalent service concurrency check. A preflight read alone cannot prevent an edit between the read and write. If the destination lacks a reliable concurrency guard, block automated writes to it and record the limitation.
6. Read back the saved source and verify every mapped result hash and preserved file. Record the new head and evidence immediately. Replan the remaining destinations using these verified completed writes and recheck again before the next mutation.

Do not advance the shared baseline until every required synchronization destination matches the verified candidate. A failed second destination leaves the old baseline intact and the first write recorded as partial success. On resume, verify that write instead of repeating or overwriting it. Sites publication and website deployment remain separate stages governed by `DEPLOYMENT.md`.

## Prove the Plant Workbench route

Start with Plants because its source is already imported into `apps/plants-workbench` and `packages/plants`. Discover current Site and mirror identities from `project-map.json`; verify actual source paths and adapter revisions before use.

Run the synthetic safety suite:

```sh
python3 -m unittest discover -s .github/scripts -p 'test_reconcile_sources.py' -v
```

The fixtures exercise both entry modes, unpublished Sites edits, disjoint changes, overlapping changes, mirror-only changes, additions, deletions, possible renames, binary files, unknown baselines, and stale plans. They do not connect to Sites or prove a live export.

Complete the live pilot in isolated source branches or a separately identified test Site. Do not add test edits to the production Site. Read live editable source first and preserve it exactly. Verify both import and export adapters before any isolated write.

| Scenario | Required result |
| --- | --- |
| `sites-first` with a Site edit and a separate monorepo edit | Candidate contains both changes; production sources stay untouched |
| `monorepo-first` with an unfinished Site edit | Export candidate preserves the unfinished edit and includes the monorepo change |
| Both sides edit the same mapped content | Plan blocks in both modes |
| A source or destination advances after planning | Fresh check or expected-head write refuses the old plan |
| Apply to an isolated destination and read back | Saved mapped hashes equal the candidate; destination-only files remain intact |
| Repeat after recording the verified result | No proposed writes; no duplicate publication or baseline advancement |

Record actual source revisions, mapping and adapter revisions, report hashes, validation commands, read-back evidence, and any unavailable concurrency guard. Keep `pilot.live_status=pending` and `downstream_export_connected` unverified until the live route passes. Synthetic fixture success alone cannot clear either field. Leave human WebGL acceptance pending unless a person performs it.

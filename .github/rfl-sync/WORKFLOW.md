# RFL synchronization procedure

Run this procedure when synchronizing RFL workbenches, Sites, component repositories and chipchirp.digital. Creating this documentation does not itself release application code.

## Entry modes and integration point

Choose `sites-first` or `monorepo-first` explicitly for each selected component and record it before planning writes. One run may mix modes. Use the user's stated starting source; if none is stated, use `monorepo-first` for imported components. Do not infer a mode from timestamps.

- `sites-first`: read the selected Site's current editable source, reconcile its changes with the monorepo, and translate the agreed result into the owning app and domain packages.
- `monorepo-first`: read the owning monorepo app and packages, reconcile destination changes, and export the agreed result to selected Sites or component mirrors.

Private `KO0I/rasd-fastwalker-league-js` is the integration point for imported components. Both modes use its domain boundaries, validation and reviewed asset locks. Neither mode grants overwrite priority or requires publishing a Site before a GitHub preview. Treat components not yet imported as legacy routes; verify their current ownership and record their route separately.

Select synchronization, private preview, or public release as separate scope. Do not deploy merely to establish synchronization.

## Inputs and inventory

Read project-map.json and the current repository guidance, .gitmodules, gitlinks, Sites hosting manifests and release workflows on every run. The map is a discovery aid; validate it against actual sources. Discover new submodules without automatically adding unrelated projects to the release.

Select the requested components and affected consumers. Read the current Sites source through the Sites skill, not the published HTML. Record Site editable-source commit separately from deployed version, monorepo branch/head and owning paths, component mirror head and parent gitlink. Record each import/export adapter and its revision; do not assume a reversible mapping exists. Freeze this inventory before mutations. Recheck heads before every write.

## Reconcile sources

Follow [RECONCILIATION.md](RECONCILIATION.md) to prepare canonical snapshots and run the read-only planner before either direction writes. Store live snapshot inventories and reports privately when they reference private monorepo content. A `ready` report describes a mapped candidate; it does not authorize writes or prove the export adapter works.

Before either direction writes, compare every selected source and destination to their last verified synchronized revisions. For a Site/monorepo pair, compute Site changes since its baseline and monorepo changes since its baseline using explicit path mappings and content hashes. Include independent component-repository changes before overwriting a mirror.

Apply disjoint changes together. Treat different edits to the same mapped content, delete/edit collisions, and ambiguous renames as conflicts. Preserve unfinished or unpublished Sites work even in `monorepo-first` mode. Stop conflicting files and their dependents for resolution; the chosen mode does not resolve conflicts automatically.

Prepare the reconciled candidate and per-destination patch outside live destinations. Record observed heads, baseline revisions, mapped paths and hashes, intended additions/modifications/deletions, preserved destination-only files, conflict decisions and validation evidence. Translate standalone Site files into app/domain ownership rather than copying editor UI into domain packages. Export only explicit allowed paths; never blindly mirror a whole directory or include private source in a public mirror.

Immediately before each write, recheck the destination head against the reconciled plan. If either side advanced, invalidate that part of the plan, reread both sides, reconcile and revalidate. A previously clean plan is not permission to overwrite newly saved Sites work. If a mapping or export adapter is unavailable, mark that destination blocked without claiming it synchronized.

Before treating a component's downstream export as connected, complete the live two-direction pilot in RECONCILIATION.md. Automated fixtures test conflict handling but do not establish a real Sites baseline or export connection.

On a first run with no baseline, compare current files and history explicitly. Stop only ambiguous conflicting changes and their dependents; do independent work. Establish a baseline only after verifying equivalent mapped content. Use expected-head checks, no force pushes. If a head changes, re-read, reconcile and revalidate affected work.

## Release order

1. Reconcile all selected components before publishing. Freeze plant candidates and asset revisions for this release; climate generation requests are authoring feedback, not a cyclic build dependency.
2. Validate and commit the reconciled monorepo candidate in dependency order. Keep plants and character/items before their climate/Interior consumers. Keep Cloud & Atmosphere distinct from planetary Climate. Follow branch rules and PR checks; preserve explicit package exports and app/domain separation. Do not equate source import with game-consumer migration.
3. For selected downstream destinations, recheck heads and apply the reconciled export patch to the Site source or component mirror. Verify mapped content after each write. Record source synchronization separately from deployment. Deploy Sites only within the requested publication scope, using exact saved versions, existing project IDs and unchanged audiences. Skip verified unchanged destinations. A Full Plate remains an RFL scene unless evidence establishes otherwise.
4. Wait for required component checks. Record pushed commit SHAs and successful CI. If game code changed, obtain the browser artifact from the intended successful RFL commit and record run ID, artifact ID and digest. Never choose the newest artifact merely by time.
5. Prepare one website release commit with exact verified gitlinks, not floating branch heads or blanket submodule update --remote. Inspect every changed path. Keep unrelated submodules unchanged.
6. Build and validate the assembled website against that set. Validate paths, imports, asset manifests, data contracts and hashes with non-WebGL checks. Leave WebGL visual testing to the human; record it as pending or explicitly accepted, never passed by inference.
7. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the website release gate. Pushes to `master` validate without publication. RFL is a private browser artifact route, not a gitlink. Production requires an explicit dispatch with `dry_run=false` and the intended exact release artifact ID. The producer must complete successfully and the receiver must verify its provenance and payload before the website can deploy. Blank artifact IDs are permitted only for validation. Private previews cannot publish.
8. Verify successful deployment and published version/deployment metadata against the release record. Validate selected public workbench routes are included in the assembled output. A submodule existing in Git is not proof its page is public. Recheck the receiver's Interiors exclusion and actual packaging policy before claiming public Interiors availability.

## Validation and private previews

Use the monorepo's current `validation.yml` for game integration, workspace checks, and release packaging once per OS. Inspect actual checks rather than relying on historical workflow filenames.

Distinguish workspace `assets.lock.json` from production `release/workbench-assets.lock.json`. Preserve the existing collector and promotion route until its consumers and replacement exports are verified. Source imported, game consumer migrated, and downstream export connected are independent milestones. Baked ship assets remain usable while legacy ship-source migration is deferred.

For a GitHub-only private preview, dispatch `browser-release.yml` from the intended checked revision with `dry_run=true`, `request_latest_assets=false`, `handoff=false`, and `itch=false`. Record the exact source SHA, run ID, artifact ID, digest and publication flags in the preview checkpoint. Verify the artifact and skipped publication stages. Mark unrequested Sites and website stages `not_in_scope`; their lack of deployment does not block private-preview completion. Interiors remains excluded until the release packaging and game-consumer integration explicitly change.

## Checkpoints and failures

Create schema-2 checkpoints for new runs. Keep schema-1 historical records readable; do not invent missing historical modes or source baselines. Establish an unknown baseline through explicit comparison before writing. After each verified write, record its expected new head before planning the next destination. A head changed by an unrecorded external edit still invalidates the affected plan.

Copy release-template.json to releases/<unique-release-id>.json on a dedicated synchronization branch in this repository. Persist checkpoints after external mutations, including partial success. Keep secrets, access tokens, account details and signed download URLs out of records. Routine `master` pushes validate without deployment. Keep incomplete records on the synchronization branch so they cannot be mistaken for a successful baseline.

Use statuses pending, succeeded, failed, blocked, unchanged_verified or not_in_scope independently for Sites, GitHub and website. Attach evidence to success: revisions, IDs, checks, hashes and terminal deployment results.

A failed prerequisite blocks its dependent work and the final website release. Completed independent work stays recorded. There is no atomic transaction across services. Resume by verifying recorded external state, then continue incomplete stages. Do not redeploy, rebake, create duplicate PRs or advance references just because an earlier tool response was interrupted. Keep the last successful baseline intact until all required synchronization destinations match and their content is verified. Then record the new source pair; publication status remains independent. Never establish a baseline from a failed export or a merely deployed older Site version.

For deployment failure, preserve the failed record and the prior release's exact commit/artifact set. Use the established rollback path within the user's authorization; never rewrite history or invent successful rollback evidence.

After a successful deployment, record final evidence on the synchronization branch without causing a second publication. Make the last successful record discoverable by a GitHub URL in the next run's baseline. Merge archival records without dispatching a production workflow.

## Completion report

Report separate status for Sites, component GitHub commits and chipchirp.digital, with exact revisions and deployed URLs. Distinguish pushed, CI-passed, deployed and human visually accepted. State blocked components and the precise missing evidence. Do not call the whole release complete while a selected required destination is blocked.

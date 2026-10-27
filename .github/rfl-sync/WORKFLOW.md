# RFL synchronization procedure

Run this procedure when synchronizing RFL workbenches, Sites, component repositories and chipchirp.digital. Creating this documentation does not itself release application code.

## Inputs and inventory

Read project-map.json and the current repository guidance, .gitmodules, gitlinks, Sites hosting manifests and release workflows on every run. The map is a discovery aid; validate it against actual sources. Discover new submodules without automatically adding unrelated projects to the release.

Select the requested components and affected consumers. Read the current Sites source through the Sites skill, not the published HTML. Record Site source commit, deployed version, GitHub branch/head and parent gitlink. Freeze this inventory before mutations. Recheck heads before every write.

## Reconcile sources

Sites is the normal starting point, not an unconditional overwrite authority. Compare both sides to the last recorded synchronized source pair, using path mapping and content hashes when the repositories have unrelated histories. Preserve GitHub-only files, workflows, documentation and independent edits. Never mirror an entire directory blindly or infer freshness from timestamps.

On a first run with no baseline, compare current files and history explicitly. Stop only ambiguous conflicting changes and their dependents; do independent work. Establish a baseline only after verifying equivalent mapped content. Use expected-head checks, no force pushes. If a head changes, re-read, reconcile and revalidate affected work.

## Release order

1. Reconcile all selected components before publishing. Freeze plant candidates and asset revisions for this release; climate generation requests are authoring feedback, not a cyclic build dependency.
2. Update and deploy affected Sites in dependency order: plants and character/items; climate and Interiors; RFL including A Full Plate. Reuse exact project IDs and preserve audiences. Use the Sites skill to push its source repository and publish exact saved versions. Skip unchanged verified deployments.
3. Synchronize the exact deployed source snapshot into each component GitHub repository. Follow its branch rules, tests and PR requirements. Pin dependency revisions and compare mapped content, allowing documented deployment-specific differences. Do not copy credentials, private configuration, caches or editor metadata.
4. Wait for required component checks. Record pushed commit SHAs and successful CI. If game code changed, obtain the browser artifact from the intended successful RFL commit and record run ID, artifact ID and digest. Never choose the newest artifact merely by time.
5. Prepare one website release commit with exact verified gitlinks, not floating branch heads or blanket submodule update --remote. Inspect every changed path. Keep unrelated submodules unchanged.
6. Build and validate the assembled website against that set. Validate paths, imports, asset manifests, data contracts and hashes with non-WebGL checks. Leave WebGL visual testing to the human; record it as pending or explicitly accepted, never passed by inference.
7. Use the actual website workflow and branch. RFL is a private browser artifact route, not a gitlink. A blank rfl_artifact_id reuses the deployed version; explicitly select the intended artifact for a game update. If pushing the parent branch auto-deploys, account for that before pushing: stage and validate the release first and ensure its game-artifact selection reaches the intended deployment. Do not let an intermediate auto-deploy silently count as the final release.
8. Verify successful deployment and published version/deployment metadata against the release record. Validate selected public workbench routes are included in the assembled output. A submodule existing in Git is not proof its page is public. Recheck the receiver's Interiors exclusion and actual packaging policy before claiming public Interiors availability.

## Checkpoints and failures

Copy release-template.json to releases/<unique-release-id>.json on a dedicated synchronization branch in this repository. Persist checkpoints after external mutations, including partial success. Keep secrets, access tokens, account details and signed download URLs out of records. Do not commit checkpoint-only updates to an auto-deploy branch during an incomplete release.

Use statuses pending, succeeded, failed, blocked, unchanged_verified or not_in_scope independently for Sites, GitHub and website. Attach evidence to success: revisions, IDs, checks, hashes and terminal deployment results.

A failed prerequisite blocks its dependent work and the final website release. Completed independent work stays recorded. There is no atomic transaction across services. Resume by verifying recorded external state, then continue incomplete stages. Do not redeploy, rebake, create duplicate PRs or advance references just because an earlier tool response was interrupted. Keep the last successful baseline intact until all required destinations match.

For deployment failure, preserve the failed record and the prior release's exact commit/artifact set. Use the established rollback path within the user's authorization; never rewrite history or invent successful rollback evidence.

After a successful deployment, record final evidence on the synchronization branch without causing a second publication. Make the last successful record discoverable by a GitHub URL in the next run's baseline. Merge archival records only through a path that accounts for any deployment trigger.

## Completion report

Report separate status for Sites, component GitHub commits and chipchirp.digital, with exact revisions and deployed URLs. Distinguish pushed, CI-passed, deployed and human visually accepted. State blocked components and the precise missing evidence. Do not call the whole release complete while a selected required destination is blocked.

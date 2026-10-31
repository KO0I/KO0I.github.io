# Deploy the website from a verified release

Pushes to `master` validate the assembled website. They do not upload a Pages artifact or deploy the website. Documentation, checkpoint, source, and gitlink commits can merge without publishing unfinished work.

To publish an RFL release and the current website:

1. Reconcile the selected sources using `WORKFLOW.md` and merge the intended website changes.
2. Run `RFL browser release` in `KO0I/rasd-fastwalker-league-js` on `main` with `dry_run=false`, `request_latest_assets=false`, and `handoff=true`. Keep `itch=false` unless that upload is also intended.
3. Complete any configured `rfl-public-handoff` environment approval. The handoff dispatches `Pages with private RFL browser artifact` on `master` with the exact artifact ID.
4. Verify that the producer run, website build, and Pages deployment succeed. Check the published `/rfl/version.json` and `/rfl/deployment.json` against the intended commit, run, artifact ID, and digest.

The receiver waits for the producer to finish successfully. Production accepts only an unexpired `rfl-release` from the fixed private repository's `browser-release.yml` workflow on `main`. It verifies the artifact digest, manifest provenance, every payload hash, and the exclusion of Interiors before replacing the assembled RFL directory. The complete website must then pass its build checks before Pages can deploy.

A private `rfl-preview`, failed or incomplete producer, invalid payload, or failed website build cannot deploy. This gate verifies automated release checks. It does not claim that human WebGL review passed.

For a website-only release, manually dispatch the Pages workflow on `master` with `dry_run=false` and the exact previously verified release artifact ID. Blank IDs are allowed only during validation. `RFL_PAGES_ENABLED` must remain `true` for publication.

For validation without publication, keep `dry_run=true`. An explicit preview artifact is allowed in this mode. A blank ID validates against the currently deployed release.

`Restore website checkpoint` remains an explicit recovery route for a previously verified complete website checkpoint. It does not select a new RFL artifact. Routine source merges never invoke recovery.

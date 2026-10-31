# Deploy the website from a verified release

Pushes to `master` validate the assembled website. They do not upload a Pages artifact or deploy the website.

## Publish a new browser release

1. Reconcile selected sources using `WORKFLOW.md` and merge the intended website changes.
2. Run `RFL browser release` in private `KO0I/rasd-fastwalker-league-js` on `main` with `dry_run=false`, `request_latest_assets=false`, and `handoff=true`. Keep `itch=false` unless that upload is intended.
3. Wait for the whole producer run to succeed. The separate `Preserve approved browser release` workflow enters the existing `rfl-public-handoff` environment and saves the exact ZIP in a private `browser-artifact-ID` Release. Complete any configured environment review.
4. After the archive is verified, the preservation workflow dispatches Pages with the original exact artifact ID. A failed preservation cannot hand off to Pages.
5. Verify the website build and deployment, then compare `/rfl/version.json` and `/rfl/deployment.json` against the intended source SHA, producer run, artifact ID, digest, and private Release tag.

The Release contains `browser.zip`, `sha256.txt`, and `provenance.json`. Its tag pins the producer commit. The receiver verifies saved successful-main provenance, the tag, attachment digests, manifest, every payload hash, and Interiors exclusion. It executes no private source or downloaded payload code. Production reads this preserved archive without requiring retained Actions artifacts or run metadata.

## Configure private Release access

The token stored as `RFL_ARTIFACTS_TOKEN` in the public repository's protected `rfl-artifact-read` environment needs **Contents: read**, **Actions: read**, and **Metadata: read**, restricted to `KO0I/rasd-fastwalker-league-js`. Contents access is required for private Release attachments and also grants source-read access within that selected repository. Keep the token unavailable to PR code. No extra permission is needed on the website dispatch credential.

An existing Actions-only token can still validate an unexpired legacy artifact in dry-run mode while this setup is completed. Production requires a readable, verified private archive.

## Backfill or roll back

To preserve existing approved bundles, manually run `Preserve approved browser release` on private `main` with an exact production artifact ID, or `all` for all retained successful production artifacts. Manual preservation never dispatches the website. Private previews and failed producers are excluded. Expired artifacts without an archive cannot be recovered by this route.

For a website-only release or RFL rollback, dispatch the Pages workflow on `master` with the original preserved artifact ID and `dry_run=true`. Review the assembled site, then repeat with `dry_run=false` to publish. Blank IDs are permitted only for validation. `RFL_PAGES_ENABLED` must be `true` for publication.

A dry run can validate an explicit private preview or, with a blank ID, the currently deployed version. A preview cannot publish. A corrupt or missing preserved attachment fails closed and never silently selects another release.

Keep preserved Releases, attachments, and tags. They have no Actions retention timer; do not replace or retarget them. The workflow reuses matching published archives and resumes matching drafts without overwriting bytes. Durable private archive receipts record `storage=private-release`, `release_tag`, and `expires_at=null`.

The RFL rollback route rebuilds the surrounding website from current `master`. For an exact complete-site rollback, `Restore website checkpoint` remains the explicit recovery route for a previously verified website package.

Automated checks do not establish human WebGL acceptance. Record visual review separately.

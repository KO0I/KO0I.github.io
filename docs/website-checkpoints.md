# Website checkpoints and rollback

These Actions apply to **chipchirp.digital**, including its deployed RFL game and
public workbenches. They do not change ChatGPT Sites or component repository source.

## Save the current working deployment

1. Open Actions → **Pages with private RFL browser artifact** and locate the run
   that deployed the version you want to keep. Its **deploy** job must be successful.
2. Copy the numeric run ID from its URL (`.../actions/runs/123456789`).
3. Open Actions → **Save website checkpoint** → **Run workflow**, use `master`,
   and paste that run ID.
4. Wait for success. The summary links to a release named
   `pages-checkpoint-RUN-ATTEMPT`. Keep this tag as your known-good version.

After these workflows reach master, every successful normal Pages deployment is
also checkpointed automatically. Dry runs do not create checkpoints. Save copies
of already deployed artifacts; it does not build or publish a new website.

A checkpoint stores the exact Pages `artifact.tar` plus its SHA-256 checksum as
GitHub Release assets. Releases do not use the Actions artifact retention timer;
keep them until you deliberately delete them. They contain only the deployable
public website, not private repository checkouts. Successful deployment does not
mean visual acceptance: choose a version you have actually tried.

Existing artifacts previously expired after one day. An expired artifact cannot
be recovered by this action, and rebuilding an old commit is not guaranteed to
reproduce the former site. New normal deployment artifacts are retained for 90 days
(subject to repository policy), giving time to retry a failed checkpoint save.

## Restore

1. Copy your known-good `pages-checkpoint-RUN-ATTEMPT` tag from Releases.
2. Open Actions → **Restore website checkpoint** → **Run workflow** on `master`.
3. Paste the tag and run. Wait for the **deploy** job to succeed.

Restore verifies the checksum and archive structure, then uploads the original
Pages tar unchanged. It does not rebuild RFL, fetch current submodules, or move
Git branches. The game version/deployment files inside the restored package stay
unchanged; the restore run summary identifies the rollback itself.

Normal deployment and restore share a concurrency group. Before restoring, cancel
any unwanted pending production deployment; a later master deployment can replace
the restored version. Restore respects `RFL_PAGES_ENABLED` and existing
`github-pages` environment protections. There is no automatic rollback based on
visual failures and no promise that this also restores browser-local saved data.

## First use and verification

The workflow files must be on master before their manual buttons and automatic
trigger are available. The implementation PR does not create a checkpoint by itself.
Before the next application release, save the currently deployed run and confirm
the release assets exist. Exercise restore during a suitable deployment window.
Local tests cover hashes, complete-site requirements, unsafe archives and run
eligibility; a real save/restore requires GitHub-hosted execution.

Published checkpoint packages are never overwritten by save retries. An interrupted
upload remains a draft release and can be completed by rerunning the same save.

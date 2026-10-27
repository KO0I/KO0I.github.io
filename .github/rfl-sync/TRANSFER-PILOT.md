# Plant transfer pilot

The pilot prepares source changes in a disposable checkout and tests them before uploading one Git tree. It does not publish Sites or advance production branches.

Run `python3 test_prepare_transfer.py` for the preparation safeguards.
Use `prepare-transfer.py --help` for options. Both checkouts must be clean. Explicit prefixes and equivalent baseline trees are required. A conflict leaves the disposable checkout for inspection and returns failure. Resume a prepared run by checking its report and staged diff; do not rerun against a dirty checkout.

The first pilot found equal dist trees at Site commit 6a0c566bbc72cf360ca50b17cf9c10bdcd88899d and GitHub commit 400ce72896666220f6f2b01e6e64aaef7042b551. New projects need their own verified baseline.

Preferred transport: authenticated Git push of the reviewed candidate to a staging branch. If Git push authentication is unavailable, read the staged index, reuse unchanged Git objects, create binary blobs as base64 and text entries in one GitHub create_tree call, then create one commit and staging branch. Preserve actual index modes and explicit deletions when generalizing this transport; the current pilot contains regular-file additions and modifications only. Verify the remote tree against the staged index. Never expose credentials in arguments or reports.

This is a tested preparation tool and a demonstrated connector fallback, not an unattended end-to-end release service. The next implementation is a durable transport/checkpoint runner using the repository release procedure.

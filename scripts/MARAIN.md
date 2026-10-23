# Building with Marain

The dictionary lives in the public KO0I/marain-dictionary repository, pinned at
`tools/marain-dictionary`. Edit its source there, publish its commit, then update
the parent gitlink. Blog posts, shared fonts, and lesson images remain in this site.

From the site repository root:

```sh
git submodule update --init tools/marain-dictionary
npm test --prefix tools/marain-dictionary
python3 scripts/prepare_site.py /tmp/site-preview-source
bundle exec jekyll serve --source /tmp/site-preview-source --destination /tmp/site-preview-output
```

Use a fresh source destination on each run. The script intentionally refuses to
overwrite an existing directory. CI uses `.site-source` on a fresh checkout.
Build the assembled directory, not the raw checkout: the assembly supplies
`/marain/`, `/lesson-rules/`, `/assets/marain/`, and the speech include while
retaining the parent site's layouts. The standalone preview instructions live
in the submodule README. Its raw sources are omitted from the assembled site.

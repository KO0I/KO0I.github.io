# Liquid Glass Lab

The Jekyll page at `/tools/liquid-glass/` uses the site's normal ChipChirp layout
and stylesheet, with scoped lab styles in `assets/css/liquid-glass.css`.
It is linked from `/tools/` and marked `interactive: true`.

`glass-shader.mjs` retains the WGSL from [arya3d/liquid-glass-webgpu](https://github.com/arya3d/liquid-glass-webgpu),
source blob `3a574df132bddde08284c5131173ecb2d31b305d`.
`renderer.mjs` adapts its WebGPU setup and `settings.mjs` retains the original
uniform ordering and default look. The original MIT notice is in
`vendor/LICENSE-arya3d.txt`.

The browser uses the vendored `html2canvas-pro` 2.6.3 distribution from
`https://registry.npmjs.org/html2canvas-pro/-/html2canvas-pro-2.6.3.tgz`.
Its minified file SHA-256 is
`436d48af523862d2b1e735803e74f355112f76dd330c061e391580b266398944`.
Its MIT notice is in `vendor/LICENSE-html2canvas-pro.txt`. No CDN or npm build
is required to serve this tool.

Only the preview content is captured. The lens is a sibling canvas, so it
never appears in its own texture. Resize and background changes recapture
the preview; slider and position changes draw on demand. Captures are
serialized and stale snapshots are discarded. The device pixel ratio is
capped at 2 and at the adapter's texture limit.

The width and height controls are preferred CSS pixel sizes. The lens scales
proportionally when the preview is narrower. JSON exports contain those
preferred sizes, normalized shader shape dimensions, and the eight optical
parameters. Corner rounding runs from a square to a fully rounded shorter
side. Refraction and edge softness stay above zero because the shader divides
by them. Reset restores the original settings and centers the lens.

WebGPU requires HTTPS or localhost and an available adapter. Unsupported
browsers retain the sample content, controls and JSON export, with an explicit
status message. Device loss hides the lens and asks for a reload. There is no
CSS simulation presented as the WebGPU effect.

Verify a built Jekyll site with:

```sh
python3 .github/tests/browser_liquid_glass.py /path/to/_site --chromium /usr/bin/chromium
```

The browser test requires Playwright and exercises real WebGPU using
Chromium's software adapter, plus unsupported and device-loss cases.

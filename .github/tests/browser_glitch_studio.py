#!/usr/bin/env python3
"""Browser integration test for /tools/png-glitch/ on a built Jekyll site."""
from __future__ import annotations
import argparse
import base64
import functools
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def run(site: Path, executable: str | None = None) -> None:
    server = ThreadingHTTPServer(('127.0.0.1', 0),
        functools.partial(QuietHandler, directory=str(site)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as playwright:
            args = {'headless': True}
            if executable:
                args['executable_path'] = executable
            browser = playwright.chromium.launch(**args)
            try:
                context = browser.new_context(accept_downloads=True,
                    viewport={'width': 1200, 'height': 900})
                context.route('**/*', lambda r: r.continue_()
                    if r.request.url.startswith(origin) or
                    r.request.url.startswith('blob:') or
                    r.request.url.startswith('data:')
                    else r.abort())
                page = context.new_page()
                page.set_default_timeout(90000)
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                response = page.goto(origin + '/tools/png-glitch/', wait_until='domcontentloaded')
                assert response and response.status == 200
                assert page.locator('h1').first.inner_text().find('Image Glitch Studio') >= 0
                assert 'webp' not in (page.locator('#pg-file').get_attribute('accept') or '').lower()
                assert 'WebP' not in page.locator('#pg-studio').inner_text()
                png = page.locator('#pg-download')
                jpeg = page.locator('#pg-download-jpeg')
                raw = page.locator('#pg-download-raw')
                expect(png).to_be_enabled()
                expect(jpeg).to_be_hidden()
                expect(raw).to_be_hidden()
                initial = page.locator('#pg-preview').evaluate('(el) => el.toDataURL("image/png")')
                assert len(initial) > 1000, 'PNG demo image is empty'
                # File inputs should strictly accept PNG and JPEG.
                page.locator('#pg-file').set_input_files({
                    'name': 'unsupported.webp', 'mimeType': 'image/webp',
                    'buffer': b'RIFF0000WEBP'
                })
                assert 'Only PNG and JPEG' in page.locator('#pg-status').inner_text()
                # JPEG output exercises both vendored libraries and actual
                # browser decode of entropy-modified JPEG files.
                page.locator('#pg-codec').select_option('jpeg')
                expect(jpeg).to_be_enabled(timeout=90000)
                expect(raw).to_be_enabled(timeout=90000)
                for mode in ['jpeg-canvas','jpeg-entropy','jpeg-quant','jpeg-hybrid']:
                    page.locator('#pg-mode').select_option(mode)
                    expect(jpeg).to_be_enabled(timeout=90000)
                    assert page.locator('#pg-preview').evaluate(
                        '(c) => c.width > 0 && c.height > 0 && c.toDataURL("image/png").length > 1000'
                    )
                with page.expect_download() as d:
                    jpeg.click()
                data = d.value.path().read_bytes()
                assert data[:2] == b'\xff\xd8' and data[-2:] == b'\xff\xd9', 'Safe JPEG export is invalid'
                with page.expect_download() as d:
                    raw.click()
                data = d.value.path().read_bytes()
                assert data[:2] == b'\xff\xd8' and data[-2:] == b'\xff\xd9', 'Raw JPEG markers are invalid'
                with page.expect_download() as d:
                    png.click()
                assert d.value.path().read_bytes()[:8] == b'\x89PNG\r\n\x1a\n'
                # Exercise real file loading and automatic codec selection.
                jpeg_input = page.locator('#pg-preview').evaluate('(c) => c.toDataURL("image/jpeg", 0.85)')
                jpeg_data = base64.b64decode(jpeg_input.split(',', 1)[1])
                page.locator('#pg-file').set_input_files({
                    'name': 'test.jpg', 'mimeType': 'image/jpeg', 'buffer': jpeg_data
                })
                assert page.locator('#pg-codec').input_value() == 'jpeg'
                expect(jpeg).to_be_enabled(timeout=90000)
                png_input = page.locator('#pg-preview').evaluate('(c) => c.toDataURL("image/png")')
                png_data = base64.b64decode(png_input.split(',', 1)[1])
                page.locator('#pg-file').set_input_files({
                    'name': 'test.png', 'mimeType': 'image/png', 'buffer': png_data
                })
                assert page.locator('#pg-codec').input_value() == 'png'
                expect(png).to_be_enabled(timeout=90000)
                expect(jpeg).to_be_hidden()
                assert not errors, 'Browser script errors: ' + repr(errors)
                print('Image Glitch Studio: PNG, JPEG, four codec modes, exports and file filters PASS')
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('site', type=Path)
    p.add_argument('--executable-path')
    args = p.parse_args()
    run(args.site.resolve(), args.executable_path)

#!/usr/bin/env python3
"""Exercise the glass shader, controls, exports, and fallback on a built site."""
import argparse
import base64
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def run(site, chromium=None):
    server = ThreadingHTTPServer(('127.0.0.1', 0),
        functools.partial(QuietHandler, directory=str(site)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as pw:
            options = dict(headless=True, args=[
                '--enable-unsafe-webgpu', '--use-angle=swiftshader',
                '--use-vulkan=swiftshader',
                '--enable-features=Vulkan', '--disable-vulkan-surface',
            ])
            if chromium:
                options['executable_path'] = chromium
            browser = pw.chromium.launch(**options)
            context = browser.new_context(viewport={'width': 1440, 'height': 1100},
                                          accept_downloads=True)
            context.route('**/*', lambda route: route.continue_()
                          if route.request.url.startswith((origin, 'data:', 'blob:'))
                          else route.abort())
            errors = []
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('console', lambda msg: errors.append(msg.text)
                    if msg.type == 'error' and 'Liquid Glass Lab:' in msg.text else None)
            page.goto(origin + '/tools/liquid-glass/')
            status = page.locator('#lg-status')
            expect(status).to_contain_text('WebGPU ready', timeout=60000)
            lens = page.locator('#lg-glass')
            expect(lens).to_be_visible()
            assert page.locator('#lg-controls input[type=range]').count() == 12
            original = json.loads(page.locator('#lg-json').input_value())
            page.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
            before = lens.evaluate('(canvas) => canvas.toDataURL()')
            page.locator('#lg-lensRefraction').fill('0.75')
            expect(page.locator('#lg-lensRefraction-value')).to_have_text('0.75')
            page.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
            after = lens.evaluate('(canvas) => canvas.toDataURL()')
            Path('/tmp/liquid-glass-render.png').write_bytes(base64.b64decode(after.split(',')[1]))
            assert after != before, f'Refraction did not change GPU pixels: {errors}'
            assert json.loads(page.locator('#lg-json').input_value())['look']['lensRefraction'] == .75

            page.locator('#lg-shape').select_option('circle')
            assert lens.bounding_box()['width'] == lens.bounding_box()['height']
            page.locator('#lg-depth').fill('0')
            assert json.loads(page.locator('#lg-json').input_value())['look']['depth'] == 0

            # All controls must reach the exported configuration.
            page.get_by_text('Light & edges', exact=True).click()
            for control in page.locator('#lg-controls input[type=range]').all():
                control.fill(control.get_attribute('max'))
            exported = json.loads(page.locator('#lg-json').input_value())
            assert exported['size'] == {'width': 480, 'height': 260, 'roundness': 100}
            assert exported['look'] == dict(depth=200, lensRefraction=1, sharp=1, f0=1,
                dispersion=.15, specPower=128, edgeHighlight=5, rimStrength=1, fresnel=2)
            page.locator('#lg-reset').click()
            assert json.loads(page.locator('#lg-json').input_value()) == original

            box = lens.bounding_box()
            lens.focus()
            page.keyboard.press('ArrowRight')
            assert lens.bounding_box()['x'] == box['x'] + 5
            page.keyboard.press('Shift+ArrowDown')
            assert lens.bounding_box()['y'] == box['y'] + 20
            box = lens.bounding_box()
            page.mouse.move(box['x'] + 40, box['y'] + 40)
            page.mouse.down()
            page.mouse.move(box['x'] + 70, box['y'] + 60, steps=4)
            page.mouse.up()
            assert abs(lens.bounding_box()['x'] - box['x'] - 30) < 1

            for preset in ['subtle', 'prism', 'magnify']:
                page.locator('#lg-preset').select_option(preset)
                expect(lens).to_be_visible()
                assert json.loads(page.locator('#lg-json').input_value()) != original
            for scene in ['grid', 'photo', 'type']:
                page.locator('#lg-scene').select_option(scene)
                expect(status).to_contain_text('WebGPU ready', timeout=30000)
                expect(lens).to_be_visible()
            page.locator('#lg-reset').click()
            with page.expect_download() as result:
                page.locator('#lg-download').click()
            assert json.loads(Path(result.value.path()).read_text()) == original

            context.grant_permissions(['clipboard-read', 'clipboard-write'])
            page.locator('#lg-copy').click()
            expect(page.locator('#lg-export-status')).to_have_text('Settings copied.')
            assert json.loads(page.evaluate('navigator.clipboard.readText()')) == original
            page.evaluate("Object.defineProperty(navigator, 'clipboard', {value: {writeText: () => Promise.reject(new Error('denied'))}, configurable: true})")
            page.locator('#lg-copy').click()
            expect(page.locator('#lg-export-status')).to_contain_text('Copy the selected JSON')
            expect(page.locator('#lg-json')).to_be_visible()

            page.set_viewport_size({'width': 390, 'height': 844})
            expect(status).to_contain_text('WebGPU ready', timeout=30000)
            expect(lens).to_be_visible()
            page.locator('#lg-width').fill('480')
            page.locator('#lg-center').click()
            bounds = page.locator('#lg-stage').bounding_box()
            box = lens.bounding_box()
            assert box['width'] <= bounds['width'] + 1
            assert box['x'] >= bounds['x'] - 1
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            expect(status).to_contain_text('WebGPU ready', timeout=30000)
            page.screenshot(path='/tmp/liquid-glass-mobile.png', full_page=True)
            page.set_viewport_size({'width': 1440, 'height': 1100})
            expect(status).to_contain_text('WebGPU ready', timeout=30000)
            page.locator('#lg-reset').click()
            page.locator('#lg-controls details').evaluate_all('(details) => details.forEach(d => d.open = false)')
            expect(status).to_contain_text('WebGPU ready', timeout=30000)
            expect(lens).to_be_visible()
            page.locator('#lg-lab').screenshot(path='/tmp/liquid-glass-desktop.png')
            assert not errors, errors

            unsupported = context.new_page()
            unsupported.add_init_script("Object.defineProperty(navigator, 'gpu', {value: undefined})")
            unsupported.goto(origin + '/tools/liquid-glass/')
            expect(unsupported.locator('#lg-status')).to_contain_text('WebGPU is unavailable')
            expect(unsupported.locator('#lg-glass')).to_be_hidden()
            unsupported.locator('#lg-preset').select_option('prism')
            assert json.loads(unsupported.locator('#lg-json').input_value())['look']['dispersion'] == .12

            no_adapter = context.new_page()
            no_adapter.add_init_script("Object.defineProperty(navigator, 'gpu', {value: {requestAdapter: async () => null}})")
            no_adapter.goto(origin + '/tools/liquid-glass/')
            expect(no_adapter.locator('#lg-status')).to_contain_text('No WebGPU adapter')

            lost = context.new_page()
            lost.add_init_script("""const request = navigator.gpu.requestAdapter.bind(navigator.gpu);
              navigator.gpu.requestAdapter = async (...args) => {
                const adapter = await request(...args);
                const getDevice = adapter.requestDevice.bind(adapter);
                adapter.requestDevice = async (...options) => {
                  const device = await getDevice(...options);
                  Object.defineProperty(device, 'lost', {value: new Promise(resolve => {
                    window.loseGlassDevice = () => resolve({reason: 'unknown'});
                  })});
                  return device;
                };
                return adapter;
              };""")
            lost.goto(origin + '/tools/liquid-glass/')
            expect(lost.locator('#lg-status')).to_contain_text('WebGPU ready', timeout=60000)
            lost.evaluate('window.loseGlassDevice()')
            expect(lost.locator('#lg-status')).to_contain_text('graphics device was lost')
            expect(lost.locator('#lg-glass')).to_be_hidden()
            browser.close()
            print('PASS: WebGPU rendering, 12 controls, presets, movement, backgrounds, exports, mobile, unsupported adapter, and device loss')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path)
    parser.add_argument('--chromium')
    args = parser.parse_args()
    run(args.site.resolve(), args.chromium)

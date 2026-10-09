#!/usr/bin/env python3
"""Exercise an actual built site with page JavaScript disabled.

python3 .github/tests/browser_static_blog.py _site
Requires Playwright and its Chromium browser; these are test-only dependencies.
Use --executable-path /usr/bin/chromium for an existing system browser.
"""
from __future__ import annotations
import argparse
from collections import Counter
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
from playwright.sync_api import sync_playwright, Error as PlaywrightError
from audit_static_blog import audit, core_documents


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        translated = super().translate_path(path)
        # GitHub Pages serves extensionless post URLs backed by .html files.
        if not Path(translated).exists() and Path(translated + '.html').is_file():
            return translated + '.html'
        return translated

    def log_message(self, format: str, *args: object) -> None:
        pass


def run(site: Path, executable: str | None = None) -> dict[str, int]:
    audit_result = audit(site)
    docs = core_documents(site)
    paths = []
    for file in docs:
        relative = '/' + file.relative_to(site).as_posix()
        paths.append(relative[:-10] if relative.endswith('index.html') else relative)
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(site)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    checks = 0
    try:
        with sync_playwright() as p:
            options = {'headless': True}
            if executable:
                options['executable_path'] = executable
            browser = p.chromium.launch(**options)
            try:
                for width in [320, 390, 992, 1440]:
                    context = browser.new_context(java_script_enabled=False, reduced_motion='reduce', viewport={'width': width, 'height': 900})
                    # External images can be unavailable in CI; they are not JS.
                    context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin) or route.request.url.startswith('data:') else route.abort())
                    page = context.new_page()
                    response = page.goto(origin + '/', wait_until='load')
                    assert response and response.status == 200, 'Home page did not load'
                    assert page.locator('main h1').first.is_visible(), 'Home heading is hidden'
                    assert page.locator('main').evaluate('(e) => getComputedStyle(e).visibility') == 'visible'
                    assert page.locator('body').evaluate('(e) => getComputedStyle(e, "::after").content') in ['none', 'normal'], 'Loading overlay remains'
                    # A native image must finish loading even with site JS disabled.
                    image = page.locator('.hero__image img').first
                    if image.count():
                        image.scroll_into_view_if_needed()
                        image.wait_for(state='visible')
                        page.wait_for_function('(e) => e.complete && e.naturalWidth > 0', arg=image.element_handle())
                    checks += 3
                    if width <= 992:
                        summary = page.locator('.site-menu > summary')
                        assert summary.is_visible()
                        summary.click()
                        assert page.locator('.site-menu[open] nav').is_visible()
                        summary.focus()
                        page.keyboard.press('Enter')
                        assert page.locator('.site-menu[open]').count() == 0
                        checks += 3
                    else:
                        assert page.locator('.top-nav').is_visible()
                        checks += 1
                    next_page = page.locator('.pagination a[rel="next"]')
                    if next_page.count():
                        next_page.click()
                        page.wait_for_load_state('domcontentloaded')
                        assert '/page/2' in page.url
                        previous = page.locator('.pagination a[rel="prev"]')
                        assert previous.count() == 1
                        previous.click()
                        page.wait_for_load_state('domcontentloaded')
                        assert urlsplit(page.url).path == '/'
                        checks += 2
                    title = page.locator('.grid .article__title a').first
                    if title.count():
                        title.click()
                        page.wait_for_load_state('domcontentloaded')
                        assert page.locator('.post__title').is_visible()
                        checks += 1
                    page.goto(origin + '/archive/', wait_until='domcontentloaded')
                    assert page.locator('.archive-list a').count() > 0
                    checks += 1
                    archive_posts = Counter(tuple(x) for x in page.locator('.archive-list a').evaluate_all('(els) => els.map(e => [e.getAttribute("href"), e.textContent.trim()])'))
                    page.goto(origin + '/', wait_until='domcontentloaded')
                    paginated_posts = []
                    visited = set()
                    while True:
                        assert page.url not in visited, 'Pagination loop'
                        visited.add(page.url)
                        paginated_posts.extend(tuple(x) for x in page.locator('.grid .article__title a').evaluate_all('(els) => els.map(e => [e.getAttribute("href"), e.textContent.trim()])'))
                        older = page.locator('.pagination a[rel="next"]')
                        if not older.count():
                            break
                        older.click()
                        page.wait_for_load_state('domcontentloaded')
                        checks += 1
                    assert Counter(paginated_posts) == archive_posts, 'Pagination omits or repeats published posts'
                    page.goto(origin + '/tags/?tag=legacy-link', wait_until='domcontentloaded')
                    for anchor in page.locator('.tag-index a').all()[:4]:
                        href = anchor.get_attribute('href')
                        anchor.click()
                        target = unquote(urlsplit(href or '').fragment)
                        assert page.locator('[id]').evaluate_all('(els, id) => els.some(e => e.id === id && getComputedStyle(e).display !== "none")', target)
                        checks += 1
                    # Full-body scan covers every labelled core document. Browser
                    # rendering samples include the static math/diagram article.
                    samples = [x for x in paths if any(t in x for t in ['trying_math_symbols', 'reading-list', 'about', '/tools/'])]
                    for path in samples[:5]:
                        page.goto(origin + path, wait_until='domcontentloaded')
                        assert page.locator('main').is_visible()
                        assert page.locator('script').count() == 0
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'), f'Page overflows at {width}px: {path}'
                        for summary in page.locator('.diagram-source > summary').all():
                            summary.click()
                        for svg in page.locator('.static-diagram svg').all():
                            assert svg.is_visible()
                        checks += 3
                    context.close()
                    # Isolate viewport checks from browser rendering state.
                    browser.close()
                    browser = p.chromium.launch(**options)
                # Enabled JS must also generate no script requests on the core.
                context = browser.new_context(java_script_enabled=True)
                requests = []
                context.on('request', lambda r: requests.append(r.url) if r.resource_type == 'script' else None)
                context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin) or route.request.url.startswith('data:') else route.abort())
                page = context.new_page()
                page.goto(origin + '/', wait_until='networkidle')
                assert not requests, f'Scripts requested: {requests}'
                context.close()
                checks += 1
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
    return {**audit_result, 'browser_checks': checks, 'viewport_widths': 4}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', nargs='?', type=Path, default=Path('_site'))
    parser.add_argument('--executable-path')
    args = parser.parse_args()
    try:
        print(json.dumps(run(args.site.resolve(), args.executable_path), indent=2))
    except (AssertionError, ValueError, OSError, PlaywrightError) as exc:
        parser.exit(1, f'{exc}\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

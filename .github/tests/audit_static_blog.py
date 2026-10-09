#!/usr/bin/env python3
"""Audit the actual Jekyll output, not Markdown or code examples.

Usage: python3 .github/tests/audit_static_blog.py _site
No third-party Python packages are required. JavaScript is allowed only below
``/tools/`` and on the three explicitly allowlisted interactive pages. A build
containing no core pages is an error.
"""
from __future__ import annotations
import argparse
from collections import Counter
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


INTERACTIVE_PAGES = {
    'culture-history/index.html',
    'marain/index.html',
    'roadmap/index.html',
}


class Document(HTMLParser):
    def __init__(self, text: str):
        super().__init__(convert_charrefs=True)
        self.kind: str | None = None
        self.errors: list[str] = []
        self.links: list[str] = []
        self.ids: set[str] = set()
        self.has_main = False
        self.styles: list[str] = []
        self.stack: list[tuple[str, set[str]]] = []
        self.grid_posts: list[str] = []
        self.archive_posts: list[str] = []
        self.pagination: dict[str, str] = {}
        self.feed(text)
        self.close()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        classes = set((a.get('class') or '').split())
        if tag == 'a' and a.get('href'):
            if any('grid' in c for _, c in self.stack) and any('article__title' in c for _, c in self.stack):
                self.grid_posts.append(a['href'])
            if any('archive-list' in c for _, c in self.stack):
                self.archive_posts.append(a['href'])
            if any('pagination' in c for _, c in self.stack) and a.get('rel') in ('prev', 'next'):
                if a['rel'] in self.pagination:
                    self.errors.append('Repeated pagination direction')
                self.pagination[a['rel']] = a['href']
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append((tag, classes))
        if tag == 'body':
            self.kind = a.get('data-site-kind')
        if tag == 'main' and a.get('id') == 'main-content':
            self.has_main = True
        if a.get('id'):
            if a['id'].startswith('tag-') and a['id'] in self.ids:
                self.errors.append(f"Duplicate tag ID: {a['id']}")
            self.ids.add(a['id'])
        if tag == 'script':
            self.errors.append('Script element found')
        for name, value in attrs:
            if name.lower().startswith('on'):
                self.errors.append(f'Inline event handler: {name}')
            if name in ('href', 'xlink:href', 'src', 'action', 'formaction', 'data') and value:
                scheme = urlsplit(''.join(value.split())).scheme.lower()
                if scheme == 'javascript':
                    self.errors.append('javascript: URL found')
        if tag == 'img' and (not (a.get('src') or a.get('srcset')) or a.get('src') == '/'):
            self.errors.append('Image has no native src/srcset')
        if tag in ('iframe', 'object', 'embed'):
            if a.get('srcdoc'):
                self.errors.append('Embedded srcdoc application')
            target = urlsplit(a.get('src') or a.get('data') or '')
            if target.scheme or target.netloc or not target.path.lower().endswith('.pdf'):
                self.errors.append(f'Embedded application/player: {target.geturl()}')
            if not a.get('title'):
                self.errors.append('Embedded PDF lacks a title')
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if tag == 'link' and 'stylesheet' in (a.get('rel') or '').split():
            href = a.get('href') or ''
            self.styles.append(href)
        if tag == 'button' and 'load-more-posts' in (a.get('class') or '').split():
            self.errors.append('JavaScript-only pagination button')

    def handle_endtag(self, tag: str) -> None:
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)


def core_documents(site: Path) -> dict[Path, Document]:
    docs = {}
    for path in sorted(site.rglob('*.html')):
        relative = path.relative_to(site).as_posix()
        if relative.startswith('tools/') or relative in INTERACTIVE_PAGES:
            continue
        document = Document(path.read_text(encoding='utf-8'))
        if document.kind != 'core':
            document.errors.append('Page outside the JavaScript allowlist is not labelled core')
        docs[path] = document
    return docs


def audit(site: Path) -> dict[str, int]:
    if not site.is_dir():
        raise ValueError(f'{site}: build directory does not exist; build Jekyll first')
    docs = core_documents(site)
    if not docs:
        raise ValueError('No core pages found. This is not a successful blog build.')
    failures: list[str] = []
    tags_file = site / 'tags' / 'index.html'
    tags = docs.get(tags_file)
    if tags is None:
        failures.append('Missing script-free /tags/ output')
    if site / 'archive' / 'index.html' not in docs:
        failures.append('Missing script-free /archive/ output')
    for path, doc in docs.items():
        label = str(path.relative_to(site))
        failures.extend(f'{label}: {msg}' for msg in doc.errors)
        if not doc.has_main:
            failures.append(f'{label}: missing main-content landmark')
        if not any(urlsplit(x).path.endswith('/css/main.css') for x in doc.styles):
            failures.append(f'{label}: missing theme stylesheet')
        for link in doc.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            # Jekyll baseurl may prefix /tags/. Decode once: ID bytes are
            # intentionally URL-encoded to avoid case/Unicode/slug collisions.
            if tags and (url.path.endswith('/tags/') or (path == tags_file and not url.path)) and url.fragment.startswith('tag-'):
                if unquote(url.fragment) not in tags.ids:
                    failures.append(f'{label}: broken tag anchor {link}')
    # Follow the actual static hrefs, and compare all list entries with the
    # archive as a multiset. Existing duplicate post URLs still count twice.
    home = site / 'index.html'
    current, previous = home, None
    visited: set[Path] = set()
    posts: list[str] = []
    while current in docs and current not in visited:
        visited.add(current)
        doc = docs[current]
        posts.extend(doc.grid_posts)
        prefix = next((urlsplit(x).path[:-len('/css/main.css')] for x in doc.styles if urlsplit(x).path.endswith('/css/main.css') and not urlsplit(x).path.endswith('/assets/css/main.css')), '')
        def resolve(href: str) -> Path:
            path = urlsplit(href).path
            if prefix and path.startswith(prefix + '/'):
                path = path[len(prefix):]
            return site / path.strip('/') / 'index.html'
        prev_link = doc.pagination.get('prev')
        if (previous is None and prev_link) or (previous is not None and (not prev_link or resolve(prev_link) != previous)):
            failures.append(f'{current}: incorrect previous-page link')
        older = doc.pagination.get('next')
        if not older:
            break
        previous, current = current, resolve(older)
        if current in visited or current not in docs:
            failures.append(f'Broken or cyclic pagination target: {older}')
    archive = docs.get(site / 'archive' / 'index.html')
    if not posts or not archive or Counter(posts) != Counter(archive.archive_posts):
        failures.append('Pagination omits or repeats archive post entries')
    css_bytes = 0
    for relative in ['css/main.css', 'assets/css/main.css']:
        file = site / relative
        if not file.is_file():
            failures.append(f'Missing stylesheet {relative}')
        else:
            content = file.read_text(encoding='utf-8')
            css_bytes += file.stat().st_size
            if '{{' in content or '{%' in content:
                failures.append(f'{relative}: unrendered Liquid in a static stylesheet')
    if failures:
        raise ValueError('\n'.join(failures))
    return {'core_pages_checked': len(docs), 'pagination_pages_checked': len(visited), 'post_entries_checked': len(posts), 'core_stylesheet_bytes': css_bytes, 'errors': 0}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path, nargs='?', default=Path('_site'))
    args = parser.parse_args()
    try:
        print(json.dumps(audit(args.site), indent=2))
    except (OSError, ValueError) as exc:
        parser.exit(1, f'{exc}\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

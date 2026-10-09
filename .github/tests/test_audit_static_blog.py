import unittest
import tempfile
from pathlib import Path
from audit_static_blog import audit, core_documents, Document


class AuditTests(unittest.TestCase):
    def test_native_content(self):
        doc = Document('<body data-site-kind="core"><main id="main-content"><details><summary>Menu</summary><a href="/">Home</a></details><img src="/photo.jpg" loading="lazy"></main></body>')
        self.assertEqual(doc.kind, 'core')
        self.assertTrue(doc.has_main)
        self.assertEqual(doc.errors, [])

    def test_scripts_and_handlers_fail(self):
        for text in ['<script src="/app.js"></script>', '<script>alert(1)</script>', '<a onclick="go()">Go</a>', '<a href="javascript:go()">Go</a>']:
            with self.subTest(text=text):
                self.assertTrue(Document(text).errors)

    def test_escaped_code_is_not_a_script(self):
        self.assertEqual(Document('<pre>&lt;script&gt;example&lt;/script&gt;</pre>').errors, [])

    def test_data_src_without_src_fails(self):
        self.assertTrue(Document('<img data-src="/photo.jpg">').errors)

    def test_third_party_player_fails(self):
        self.assertTrue(Document('<iframe title="Video" src="https://www.youtube.com/embed/example"></iframe>').errors)

    def test_local_pdf_passes(self):
        self.assertEqual(Document('<iframe title="Paper" src="/assets/pdf/paper.pdf"></iframe>').errors, [])

    def test_tag_id_collision_fails(self):
        self.assertTrue(Document('<section id="tag-c"></section><section id="tag-c"></section>').errors)

    def test_empty_native_image_fails(self):
        self.assertTrue(Document('<img src="/">').errors)


class BuildAuditTests(unittest.TestCase):
    def fixture(self, site):
        (site / 'css').mkdir()
        (site / 'assets/css').mkdir(parents=True)
        (site / 'css/main.css').write_text('body{color:white}')
        (site / 'assets/css/main.css').write_text('.marain{font-family:Marain}')
        def page(path, content):
            target = site / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('<body data-site-kind="core"><link rel="stylesheet" href="/css/main.css"><main id="main-content">' + content + '</main></body>')
        card = '<div class="grid"><h2 class="article__title"><a href="/one">One</a></h2></div>'
        page('index.html', card + '<nav class="pagination"><a rel="next" href="/page/2">Older</a></nav>')
        page('page/2/index.html', card + '<nav class="pagination"><a rel="prev" href="/">Newer</a></nav>')
        page('archive/index.html', '<ul class="archive-list"><li><a href="/one">One</a></li><li><a href="/one">One</a></li></ul>')
        page('tags/index.html', '<section id="tag-c%2B%2B"><a href="#tag-c%252B%252B">C++</a></section>')

    def test_real_output_required(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(ValueError, 'No core pages'):
                audit(Path(folder))

    def test_only_named_interactive_routes_are_exempt(self):
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder)
            for relative in ['tools/app/index.html', 'marain/index.html',
                             'culture-history/index.html', 'roadmap/index.html']:
                target = site / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text('<script src="app.js"></script>')
            self.assertEqual(core_documents(site), {})

            target = site / 'another-app/index.html'
            target.parent.mkdir(parents=True)
            target.write_text('<body data-site-kind="interactive"><script src="app.js"></script></body>')
            docs = core_documents(site)
            self.assertIn(target, docs)
            self.assertIn('Script element found', docs[target].errors)

    def test_pagination_preserves_duplicate_url_entries(self):
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder)
            self.fixture(site)
            self.assertEqual(audit(site)['post_entries_checked'], 2)

    def test_broken_pagination_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder)
            self.fixture(site)
            p = site / 'index.html'
            p.write_text(p.read_text().replace('/page/2', '/page/99'))
            with self.assertRaisesRegex(ValueError, 'pagination target'):
                audit(site)

    def test_missing_previous_link_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder)
            self.fixture(site)
            p = site / 'page/2/index.html'
            p.write_text(p.read_text().replace('rel="prev"', 'rel="other"'))
            with self.assertRaisesRegex(ValueError, 'previous-page link'):
                audit(site)

    def test_omitted_archive_entry_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder)
            self.fixture(site)
            p = site / 'archive/index.html'
            p.write_text(p.read_text().replace('<li><a href="/one">One</a></li>', '', 1))
            with self.assertRaisesRegex(ValueError, 'omits or repeats'):
                audit(site)


if __name__ == '__main__':
    unittest.main()

import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('prepare_site', Path(__file__).with_name('prepare_site.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SiteAssemblyTests(unittest.TestCase):
    def test_missing_submodule_does_not_create_output(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            with self.assertRaisesRegex(ValueError, 'submodule'):
                module.prepare(root, root / 'output')
            self.assertFalse((root / 'output').exists())

    def test_overlay_keeps_theme_and_excludes_raw_repo(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / 'source'
            submodule = source / 'tools/marain-dictionary'
            for name in module.OVERLAYS:
                path = submodule / name
                if name == 'assets/marain':
                    path = path / 'js/dict.js'
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('extracted')
            for name in ['_layouts/page.html', 'assets/fonts/marain.woff', '.git/config', '_site/old.html']:
                path = source / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('parent')
            output = module.prepare(source, source / '.site-source')
            self.assertEqual((output / '_layouts/page.html').read_text(), 'parent')
            self.assertEqual((output / '_pages/marain.markdown').read_text(), 'extracted')
            self.assertTrue((output / 'assets/fonts/marain.woff').exists())
            for name in ['tools/marain-dictionary', '.git', '_site', '.site-source']:
                self.assertFalse((output / name).exists())
            with self.assertRaisesRegex(ValueError, 'new directory'):
                module.prepare(source, output)


if __name__ == '__main__':
    unittest.main()

#!/usr/bin/env python3
"""Assemble Jekyll sources with the pinned Marain submodule into a fresh directory."""
import argparse
from pathlib import Path
import shutil


OVERLAYS = (
    '_pages/marain.markdown', '_pages/lesson-rules.markdown',
    '_includes/marain-tts.html', 'assets/marain',
)


def prepare(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    module = source / 'tools/marain-dictionary'
    for relative in OVERLAYS:
        if not (module / relative).exists():
            raise ValueError('Marain submodule missing or incomplete; run git submodule update --init tools/marain-dictionary')
    if destination.exists() or destination == source or destination in source.parents:
        raise ValueError('Destination must be a new directory, not the source or its ancestor')

    def ignore(directory, names):
        excluded = {name for name in names if name in {'.git', '_site', '.site-source', '.jekyll-cache', '.bundle', 'node_modules', '__pycache__'}}
        if Path(directory) == source / 'tools':
            excluded.add('marain-dictionary')
        for name in names:
            if Path(directory) / name == destination:
                excluded.add(name)
        return excluded

    shutil.copytree(source, destination, ignore=ignore)
    for relative in OVERLAYS:
        src, dst = module / relative, destination / relative
        if dst.exists():
            raise ValueError(f'Stale parent-owned Marain source: {relative}')
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    parser.add_argument('--source', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    try:
        print(prepare(args.source, args.destination))
    except (ValueError, OSError) as error:
        parser.exit(1, f'{error}\n')

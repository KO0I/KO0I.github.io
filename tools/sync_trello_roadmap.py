#!/usr/bin/env python3
"""Refresh Jekyll's fallback from the public Trello board; Python 3.9+, no dependencies."""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import urllib.error
import urllib.request

DEFAULT_BOARD = 'f0B5vTRf'


def transform(data, board):
    if (data.get('shortLink') != board or
            data.get('prefs', {}).get('permissionLevel') != 'public' or
            not isinstance(data.get('lists'), list) or
            not isinstance(data.get('cards'), list)):
        raise ValueError('Expected a public Trello board with lists and cards.')
    groups = []
    for group in sorted(data['lists'], key=lambda x: x['pos']):
        if group['closed']:
            continue
        if not isinstance(group['name'], str):
            raise ValueError('Invalid list name.')
        cards = []
        for card in sorted(data['cards'], key=lambda x: x['pos']):
            if card['closed'] or card['idList'] != group['id']:
                continue
            if not isinstance(card['name'], str) or not re.fullmatch(r'[A-Za-z0-9]{8}', card['shortLink']):
                raise ValueError('Invalid card data.')
            cards.append({'title': card['name'], 'url': 'https://trello.com/c/' + card['shortLink']})
        groups.append({'name': group['name'], 'cards': cards})
    return {'board_url': 'https://trello.com/b/' + board, 'lists': groups}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--board', default=DEFAULT_BOARD, help='Eight-character public board ID')
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] / '_data/trello_roadmap.json')
    parser.add_argument('--input', type=Path, help='Use a downloaded Trello JSON export instead of the network')
    args = parser.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9]{8}', args.board):
        parser.error('--board must be an eight-character Trello board ID')
    try:
        if args.input:
            data = json.loads(args.input.read_text(encoding='utf-8'))
        else:
            request = urllib.request.Request('https://trello.com/b/' + args.board + '.json', headers={'Accept': 'application/json'})
            with urllib.request.urlopen(request, timeout=25) as response:
                data = json.load(response)
        result = transform(data, args.board)
        content = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
        if args.output.exists() and args.output.read_text(encoding='utf-8') == content:
            print('Roadmap already up to date.')
            return 0
        args.output.parent.mkdir(parents=True, exist_ok=True)
        # Replace only after the entire response validates; failures preserve the fallback.
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=args.output.parent, delete=False) as handle:
                temporary = handle.name
                handle.write(content)
            os.replace(temporary, args.output)
        finally:
            if temporary and os.path.exists(temporary):
                os.unlink(temporary)
        count = sum(len(group['cards']) for group in result['lists'])
        print(f'Updated {count} cards in {len(result["lists"])} lists: {args.output}')
        return 0
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f'Sync failed ({type(error).__name__}); existing data left unchanged.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())

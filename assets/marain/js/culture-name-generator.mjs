/*
 * Non-ship Culture-style name generator.
 * Trains locally on the user-supplied source-name corpus, without changing it.
 * Generated names are inventions, not attested or verified canonical names.
 */

export const CULTURE_NAME_STYLES = Object.freeze([
  'mixed', 'single', 'personal', 'hyphenated', 'place', 'institution', 'elaborate'
]);

const EXCLUDED_WORDS = new Set((
  'a an and at by de degree fifth for from in inner lower of on or the two ' +
  'alien affairs army board becoming bureau city company contact cultural culture ' +
  'circumstances empire enablement explorer faction far federation federacy fifth ' +
  'floret form four great greater heavenly hegemonarchy hidden hills host humanists ' +
  'imperial invisibles lakes landing light livery merchant mission monopolies ' +
  'nameless nearpole ocean order origin palace parade park peace pendant pittance ' +
  'preservationeers prime procreational raiders reliquaria revenge rock sea ' +
  'souls special street temple tertiary tower twinned unity wars world ' +
  'disk crater lower upper queen everlasting spray cultural special'
).split(/\s+/));

function cleanName(name) {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function parseCultureNameCorpus(text) {
  if (typeof text !== 'string') throw new TypeError('Expected newline-delimited text');
  return text.split(/\r?\n/u).map(cleanName).filter(Boolean);
}

function canonicalKey(name) {
  return name.toLocaleLowerCase('en').replace(/[’‘]/gu, "'").replace(/\s+/gu, ' ').trim();
}

function sourceTokens(names) {
  return names.flatMap(name => name.match(/\p{L}+/gu) || [])
    .filter(token => token.length >= 3 && token.length <= 20)
    .filter(token => !/^[A-Z]{2,}$/u.test(token))
    .map(token => token.toLocaleLowerCase('en'))
    .filter(token => !EXCLUDED_WORDS.has(token));
}

function buildChains(words, order) {
  const result = new Map();
  for (const word of words) {
    const chars = Array.from('^'.repeat(order) + word + '$');
    for (let i = order; i < chars.length; i += 1) {
      const context = chars.slice(i - order, i).join('');
      if (!result.has(context)) result.set(context, []);
      result.get(context).push(chars[i]);
    }
  }
  return result;
}

/* FNV-1a plus mulberry32: repeatable for the same seed and style. */
function seededRandom(seed) {
  let state = 2166136261;
  for (const char of String(seed)) {
    state ^= char.codePointAt(0);
    state = Math.imul(state, 16777619);
  }
  return function next() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function choose(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function titleCase(word) {
  return word.charAt(0).toLocaleUpperCase('en') + word.slice(1);
}

function plausible(word) {
  return word.length >= 3 && word.length <= 17 && /[aeiouyäöü]/iu.test(word) &&
    !/(.)\1\1/iu.test(word) && !/[bcdfghjklmnpqrstvwxz]{5}/iu.test(word);
}

/** Generate invented names using variable-order character transitions and corpus-derived formats. */
export function createCultureNameGenerator(rawNames) {
  if (!Array.isArray(rawNames)) throw new TypeError('Expected an array of names');
  const names = rawNames.map(name => cleanName(String(name))).filter(Boolean);
  const canonical = new Set(names.map(canonicalKey));
  const words = sourceTokens(names);
  if (words.length < 12) throw new RangeError('Insufficient source names to train the generator');
  const originalWords = new Set(words);
  const two = buildChains(words, 2);
  const three = buildChains(words, 3);

  function makeWord(rng, min = 4, max = 14) {
    for (let attempt = 0; attempt < 140; attempt += 1) {
      let letters = '';
      for (let i = 0; i < max; i += 1) {
        const longContext = ('^^^' + letters).slice(-3);
        const shortContext = ('^^' + letters).slice(-2);
        const possible = (rng() < 0.58 ? three.get(longContext) : two.get(shortContext)) ||
          two.get(shortContext) || three.get(longContext) || [];
        const options = i < min ? possible.filter(char => char !== '$') : possible;
        if (!options.length) break;
        const next = choose(options, rng);
        if (next === '$') break;
        letters += next;
      }
      if (letters.length >= min && plausible(letters) && !originalWords.has(letters) &&
          !canonical.has(canonicalKey(letters))) {
        return titleCase(letters);
      }
    }
    // A fallback for unusually homogeneous reference corpora; still not an original word.
    for (let tries = 0; tries < 100; tries += 1) {
      const left = choose(words, rng);
      const right = choose(words, rng);
      const cutLeft = Math.max(2, Math.floor(left.length * 0.56));
      const cutRight = Math.max(1, Math.floor(right.length * 0.44));
      const combined = left.slice(0, cutLeft) + right.slice(cutRight);
      if (plausible(combined) && !originalWords.has(combined) &&
          !canonical.has(canonicalKey(combined))) return titleCase(combined);
    }
    return null;
  }

  const placeSuffixes = ['Prime', 'World', 'Hills', 'Lakes', 'Ocean', 'Gate', 'Tower',
    'Sea', 'Crater', 'Park', 'Disk', 'Reliquaria', 'II', 'IV', 'VII'];
  const institutionSuffixes = ['Bureau', 'Order', 'Faction', 'Federacy',
    'Hegemonarchy', 'Mission', 'Enablement', 'Company', 'Collective', 'Council'];
  const boardConcepts = ['Becoming', 'Form', 'Origin', 'Unity', 'Affairs', 'Preservation'];

  function compose(style, rng) {
    const word = () => makeWord(rng);
    const join = (...parts) => parts.every(Boolean) ? parts.join(' ') : null;
    switch (style) {
      case 'single': return word();
      case 'personal': {
        const first = word();
        const family = rng() < 0.16 ? [word(), word()].join('-') : word();
        return rng() < 0.19 ? join(first, word(), family) : join(first, family);
      }
      case 'hyphenated': {
        const first = word(), second = word();
        return first && second ? first + (rng() < 0.1 ? '’' : '-') + second : null;
      }
      case 'place': {
        const first = word();
        if (!first) return null;
        return rng() < 0.13 ? first + '-' + word() : join(first, choose(placeSuffixes, rng));
      }
      case 'institution': {
        const first = word();
        if (!first) return null;
        if (rng() < 0.16) return 'Board of ' + choose(boardConcepts, rng) + ' ' + first;
        if (rng() < 0.18) return join(first + '-' + word(), 'Cultural', 'Federacy');
        return join(first, choose(institutionSuffixes, rng));
      }
      case 'elaborate': {
        const parts = Array.from({length: 3 + Math.floor(rng() * 3)}, word);
        if (rng() < 0.12) parts.unshift('Lo');
        return join(...parts);
      }
      default: {
        const weighted = [
          'single', 'single', 'single', 'single', 'personal', 'personal',
          'personal', 'hyphenated', 'place', 'place', 'institution', 'elaborate'
        ];
        return compose(choose(weighted, rng), rng);
      }
    }
  }

  function generate({style = 'mixed', count = 10, seed = ''} = {}) {
    if (!CULTURE_NAME_STYLES.includes(style)) throw new RangeError('Unknown name style');
    if (!Number.isInteger(count) || count < 1 || count > 50) {
      throw new RangeError('Count must be between 1 and 50');
    }
    const rng = seededRandom(String(seed) + '|' + style);
    const chosen = new Set();
    const output = [];
    for (let attempts = 0; output.length < count && attempts < count * 180; attempts += 1) {
      const candidate = compose(style, rng);
      if (!candidate || candidate.includes('null')) continue;
      const key = canonicalKey(candidate);
      if (canonical.has(key) || chosen.has(key)) continue;
      chosen.add(key);
      output.push(candidate);
    }
    return output;
  }

  return Object.freeze({
    sourceCount: names.length,
    trainingTokenCount: words.length,
    generate,
    isOriginal: candidate => canonical.has(canonicalKey(candidate))
  });
}

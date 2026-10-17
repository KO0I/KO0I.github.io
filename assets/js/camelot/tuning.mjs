/**
 * Shared pitch-class mathematics for the Camelot / EDO explorer.
 * All indices are relative to a user-selected reference frequency.
 * No music-theory or cultural interpretation is assumed by this module.
 */
export const TUNING_VERSION = 1;
export const MIN_EDO = 2;
export const MAX_EDO = 4096;
export const DEFAULT_REFERENCE_HZ = 440;

export function validateEdo(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < MIN_EDO || n > MAX_EDO) {
    throw new RangeError('EDO division count must be an integer from 2 to 4096');
  }
  return n;
}

export function validateReference(value) {
  const hz = Number(value);
  if (!Number.isFinite(hz) || hz < 1 || hz > 20000) {
    throw new RangeError('Reference frequency must be between 1 Hz and 20,000 Hz');
  }
  return hz;
}

export function mod(n, modulus) {
  if (!Number.isSafeInteger(modulus) || modulus <= 0) throw new RangeError('Invalid modulus');
  return ((n % modulus) + modulus) % modulus;
}

export function cents(steps, edo) {
  return (1200 * steps) / validateEdo(edo);
}

export function frequency(steps, edo, referenceHz = DEFAULT_REFERENCE_HZ) {
  return validateReference(referenceHz) * 2 ** (steps / validateEdo(edo));
}

export function centsBetween(aHz, bHz) {
  if (!(aHz > 0) || !(bHz > 0)) throw new RangeError('Frequencies must be positive');
  return 1200 * Math.log2(bHz / aHz);
}

export function gcd(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

export function fifthGenerator(edo) {
  const n = validateEdo(edo);
  return mod(Math.round(n * Math.log2(3 / 2)), n) || 1;
}

export function generatorCycles(edo, generator = fifthGenerator(edo)) {
  const n = validateEdo(edo);
  const step = mod(Number(generator), n);
  if (!Number.isSafeInteger(Number(generator)) || step === 0) {
    throw new RangeError('Generator must be an integer not divisible by N');
  }
  const visited = new Set();
  const result = [];
  for (let start = 0; start < n; start++) {
    if (visited.has(start)) continue;
    const cycle = [];
    for (let current = start; !visited.has(current); current = mod(current + step, n)) {
      visited.add(current);
      cycle.push(current);
    }
    result.push(cycle);
  }
  return result;
}

export function wheelOrder(edo, layout = 'chromatic', generator) {
  const n = validateEdo(edo);
  if (layout === 'chromatic') return Array.from({length: n}, (_, i) => i);
  if (layout === 'generator') return generatorCycles(n, generator ?? fifthGenerator(n)).flat();
  throw new RangeError('Unknown wheel layout');
}

export function normalizeSteps(values, edo) {
  const n = validateEdo(edo);
  if (!Array.isArray(values)) throw new TypeError('Steps must be an array');
  if (values.length > 4096) throw new RangeError('Too many steps');
  const result = new Set();
  for (const value of values) {
    const x = Number(value);
    if (!Number.isSafeInteger(x)) throw new TypeError('Pitch steps must be integers');
    result.add(mod(x, n));
  }
  return [...result].sort((a, b) => a - b);
}

export function transposeSteps(steps, shift, edo) {
  const n = validateEdo(edo);
  if (!Number.isSafeInteger(Number(shift))) throw new TypeError('Invalid transposition');
  return normalizeSteps(normalizeSteps(steps, n).map(x => x + Number(shift)), n);
}

export function rotateMode(steps, degreeIndex, edo) {
  const notes = normalizeSteps(steps, edo);
  if (!notes.length) return [];
  const degree = mod(degreeIndex, notes.length);
  return transposeSteps(notes, -notes[degree], edo);
}

const MAJOR_STEPS_12 = [0, 2, 4, 5, 7, 9, 11];
const MINOR_STEPS_12 = [0, 2, 3, 5, 7, 8, 10];
const PENTATONIC_STEPS_12 = [0, 2, 4, 7, 9];

/** Named traditional patterns are described as 12-EDO approximations outside 12-EDO. */
export function scalePresets(edo) {
  const n = validateEdo(edo);
  const approximate = source => normalizeSteps(source.map(s => Math.round(s * n / 12)), n);
  return [
    {id: 'major', name: n === 12 ? 'Major (12-EDO)' : 'Major-pattern approximation', steps: approximate(MAJOR_STEPS_12)},
    {id: 'minor', name: n === 12 ? 'Natural minor (12-EDO)' : 'Minor-pattern approximation', steps: approximate(MINOR_STEPS_12)},
    {id: 'pentatonic', name: n === 12 ? 'Major pentatonic (12-EDO)' : 'Pentatonic-pattern approximation', steps: approximate(PENTATONIC_STEPS_12)},
    ...(n === 19 ? [{id:'diatonic19',name:'19-EDO 5L2s example',steps:[0,3,6,8,11,14,17]}] : [])
  ];
}

export function intervalClass(a, b, edo) {
  const n = validateEdo(edo);
  const diff = mod(b - a, n);
  return Math.min(diff, n - diff);
}

export function circularDistance(a, b, edo) {
  return cents(intervalClass(a, b, edo), edo);
}

export function intervalHistogram(steps, edo) {
  const notes = normalizeSteps(steps, edo);
  const counts = new Map();
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const ic = intervalClass(notes[i], notes[j], edo);
      counts.set(ic, (counts.get(ic) || 0) + 1);
    }
  }
  return counts;
}

/** Independent measurements. Deliberately does not return a compatibility score. */
export function comparePitchSets(leftSteps, rightSteps, edo) {
  const a = normalizeSteps(leftSteps, edo);
  const b = normalizeSteps(rightSteps, edo);
  const bSet = new Set(b);
  const common = a.filter(s => bSet.has(s));
  const nearest = (from, to) => from.length && to.length
    ? from.reduce((sum, pitch) =>
      sum + Math.min(...to.map(other => circularDistance(pitch, other, edo))), 0) / from.length
    : null;
  const h1 = intervalHistogram(a, edo), h2 = intervalHistogram(b, edo);
  let matchingIntervalPairs = 0;
  for (const [interval, count] of h1) {
    matchingIntervalPairs += Math.min(count, h2.get(interval) || 0);
  }
  return {
    common,
    commonCount: common.length,
    nearestCentsLeftToRight: nearest(a, b),
    nearestCentsRightToLeft: nearest(b, a),
    matchingIntervalPairs
  };
}

const CAMELOT_MINOR = ['G♯ minor / A♭ minor','D♯ minor / E♭ minor','A♯ minor / B♭ minor','F minor','C minor','G minor','D minor','A minor','E minor','B minor','F♯ minor','C♯ minor / D♭ minor'];
const CAMELOT_MAJOR = ['B major','F♯ major / G♭ major','D♭ major / C♯ major','A♭ major','E♭ major','B♭ major','F major','C major','G major','D major','A major','E major'];

export function camelotName(code) {
  const match = /^(1[0-2]|[1-9])([AB])$/.exec(code);
  if (!match) throw new RangeError('Invalid Camelot key');
  return (match[2] === 'A' ? CAMELOT_MINOR : CAMELOT_MAJOR)[Number(match[1]) - 1];
}

export function camelotRelated(code) {
  camelotName(code);
  const n = Number(code.slice(0, -1));
  const kind = code.at(-1);
  const opposite = kind === 'A' ? 'B' : 'A';
  return [
    {code, label: 'Same key'},
    {code: n + opposite, label: 'Relative'},
    {code: mod(n - 2, 12) + 1 + kind, label: '−1'},
    {code: mod(n, 12) + 1 + kind, label: '+1'}
  ];
}

export function formatNumber(num, digits = 2) {
  return Number.isFinite(num) ? Number(num).toFixed(digits) : '—';
}

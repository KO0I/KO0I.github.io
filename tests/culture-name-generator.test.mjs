import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createCultureNameGenerator, parseCultureNameCorpus, CULTURE_NAME_STYLES
} from '../assets/marain/js/culture-name-generator.mjs';

const file = new URL('../assets/marain/culture-names.txt', import.meta.url);
const referenceNames = parseCultureNameCorpus(readFileSync(file, 'utf8'));
const generator = createCultureNameGenerator(referenceNames);

test('reference source preserved in supplied order', () => {
  assert.equal(referenceNames.length, 784);
  assert.equal(new Set(referenceNames).size, 784);
  assert.equal(referenceNames[0], '200.59 Risytcin');
  assert.equal(referenceNames.at(-1), 'Zyse');
  assert.ok(referenceNames.includes('Diziet Sma'));
  assert.ok(referenceNames.includes('Geseptian-Fardesile Cultural Federacy'));
  assert.ok(referenceNames.includes('Eä'));
  assert.ok(referenceNames.includes('Fal ’Ngeestra'));
});

test('the generator is deterministic for the same seed and style', () => {
  const settings = { style: 'mixed', count: 20, seed: 'rasd-fastwalker' };
  assert.deepEqual(generator.generate(settings), generator.generate(settings));
  assert.notDeepEqual(generator.generate(settings), generator.generate({ ...settings, seed: 'calt' }));
});

for (const style of CULTURE_NAME_STYLES) {
  test(style + ' generates 20 noncanonical unique names', () => {
    const result = generator.generate({style, count: 20, seed: 'culture-test'});
    assert.equal(result.length, 20);
    assert.equal(new Set(result.map(s => s.toLocaleLowerCase())).size, 20);
    assert.ok(result.every(name => !generator.isOriginal(name)));
    assert.ok(result.every(name => !name.includes('null') && name.length > 2));
  });
}

test('reject invalid styles and counts', () => {
  assert.throws(() => generator.generate({style: 'ship'}), /Unknown name style/);
  assert.throws(() => generator.generate({count: 0}), /Count/);
  assert.throws(() => generator.generate({count: 1000}), /Count/);
});

test('parsing does not change original capitalization or punctuation', () => {
  assert.deepEqual(parseCultureNameCorpus('Eä\r\nQ’naywa\n Fal ’Ngeestra \n'),
    ['Eä', 'Q’naywa', 'Fal ’Ngeestra']);
});

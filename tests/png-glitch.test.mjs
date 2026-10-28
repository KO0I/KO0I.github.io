import test from 'node:test';
import assert from 'node:assert/strict';
import { glitchImage, random, MODES } from '../assets/js/png-glitch/engine.mjs';

function sample(w = 64, h = 48) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    data[i] = (x * 7 + y * 2) % 256;
    data[i + 1] = (x * 11 + y * 7) % 256;
    data[i + 2] = (x * 13 + y * 17) % 256;
    data[i + 3] = x % 7 === 0 ? 0 : 255;
  }
  return { width: w, height: h, data };
}

test('effects are deterministic, destructive and preserve dimensions and transparency', () => {
  const input = sample();
  for (const mode of MODES) {
    const opts = { mode, seed: 104, intensity: 80, density: 90 };
    const a = glitchImage(input, opts), b = glitchImage(input, opts);
    assert.deepEqual(a, b, mode);
    assert.equal(a.data.length, input.data.length);
    assert.equal(a.width, input.width);
    assert.equal(a.height, input.height);
    assert.notDeepEqual(a.data, input.data, mode);
    for (let i = 3; i < a.data.length; i += 4) assert.equal(a.data[i], input.data[i]);
  }
});
test('zero intensity and zero density leave input unchanged', () => {
  const input = sample();
  for (const options of [{ intensity: 0 }, { density: 0 }]) {
    assert.deepEqual(glitchImage(input, options).data, input.data);
  }
});
test('input is never mutated, and changing seed changes the result', () => {
  const image = sample();
  const before = image.data.slice();
  const a = glitchImage(image, { seed: 5, intensity: 70, density: 80 });
  const b = glitchImage(image, { seed: 6, intensity: 70, density: 80 });
  assert.deepEqual(image.data, before);
  assert.notDeepEqual(a.data, b.data);
});
test('tiny images and full-range seeds are supported', () => {
  for (const width of [1, 2, 3, 7]) for (const height of [1, 2, 3]) {
    const input = sample(width, height);
    for (const mode of MODES) {
      const result = glitchImage(input, { mode, seed: 4294967295, intensity: 100, density: 100 });
      assert.equal(result.data.length, input.data.length);
    }
  }
  assert.equal(random(0)(), random(0)());
});
test('reject malformed pixel input', () => {
  assert.throws(() => glitchImage({ width: 100, height: 100, data: new Uint8Array(16) }), TypeError);
  assert.throws(() => glitchImage({ width: 0, height: 0, data: [] }), TypeError);
});

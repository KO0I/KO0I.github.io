import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectJpeg, bendJpegWithP5, JPEG_MODES } from '../assets/js/png-glitch/jpeg-engine.mjs';

function fixture() {
  // Marker and quantization layout resembling a baseline JPEG.
  const bytes = [
    0xff, 0xd8,
    0xff, 0xe0, 0x00, 0x04, 0, 0,
    0xff, 0xdb, 0x00, 0x43, 0x00, ...Array(64).fill(32),
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    ...Array.from({length: 256}, (_, i) => (i * 37 + 31) % 240),
    0xff, 0xd9
  ];
  return Uint8Array.from(bytes);
}

function stubDocument(fn) {
  const prev = globalThis.document;
  globalThis.document = { createElement: () => ({ toDataURL: () => 'data:image/jpeg;base64,', remove: () => {} }) };
  try { return fn(); } finally {
    if (prev === undefined) delete globalThis.document;
    else globalThis.document = prev;
  }
}

test('JPEG mode selection is explicit and keeps both upstream engines', () => {
  assert.deepEqual(JPEG_MODES, ['jpeg-hybrid', 'jpeg-canvas', 'jpeg-entropy', 'jpeg-quant']);
});

test('JPEG parser locates scan data and quantization payload', () => {
  const data = fixture(), info = inspectJpeg(data);
  assert.ok(info.scanStart > info.quantTables[0].offset + 63);
  assert.equal(info.quantTables.length, 1);
  assert.equal(info.quantTables[0].precision, 0);
  assert.equal(info.scanEnd, data.length - 2);
  assert.throws(() => inspectJpeg(new Uint8Array(4)), /Not a JPEG/);
  assert.throws(() => inspectJpeg(Uint8Array.from([255,216,255,219,255,255,0,1,2,3])), Error);
});

test('p5.glitch quantization mutates values while retaining segment boundaries', () => {
  stubDocument(() => {
    const input = fixture();
    const a = bendJpegWithP5(input, {seed:23,damage:90,density:100,quantization:100,entropy:false});
    const b = bendJpegWithP5(input, {seed:23,damage:90,density:100,quantization:100,entropy:false});
    assert.deepEqual(a,b);
    assert.equal(a.length,input.length);
    assert.notDeepEqual(a,input);
    const before = inspectJpeg(input), after = inspectJpeg(a);
    assert.deepEqual(after,before);
    for(let i=before.scanStart;i<input.length;i++) assert.equal(a[i],input[i]);
    assert.equal(a[0],255); assert.equal(a[1],216);
  });
});

test('p5.glitch entropy mode does not mutate JPEG headers', () => {
  stubDocument(() => {
    const input = fixture();
    const result = bendJpegWithP5(input,{seed:9,damage:90,density:100,quantize:false,entropy:true});
    const metadata = inspectJpeg(input);
    assert.deepEqual(result.slice(0,metadata.scanStart),input.slice(0,metadata.scanStart));
    assert.notDeepEqual(result.slice(metadata.scanStart,metadata.scanEnd),input.slice(metadata.scanStart,metadata.scanEnd));
    assert.deepEqual(result.slice(-2),input.slice(-2));
  });
});

test('zero damage and zero density leave JPEG unmodified', () => {
  stubDocument(() => {
    const image = fixture();
    assert.deepEqual(bendJpegWithP5(image,{damage:0}),image);
    assert.deepEqual(bendJpegWithP5(image,{density:0}),image);
  });
});

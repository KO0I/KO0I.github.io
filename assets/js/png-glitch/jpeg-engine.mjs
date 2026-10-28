/**
 * JPEG codec databending: glitch-canvas's compressed-stream corruption +
 * p5.glitch's binary mutation/quantization-table operations.
 *
 * Both libraries are MIT licensed and vendored; see vendor/LICENSES.md.
 * Processing is local. The returned RGBA frame can always be safely re-encoded.
 */
import glitchCanvas from './vendor/glitch-canvas.mjs';
import { Glitch } from './vendor/p5-glitch.mjs';
import { random } from './engine.mjs';

export const JPEG_MODES = Object.freeze(['jpeg-hybrid', 'jpeg-canvas', 'jpeg-entropy', 'jpeg-quant']);
const limit = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Parse marker segments up to the first start-of-scan marker in a JPEG.
 * The studio only feeds baseline JPEGs encoded by canvas to this function.
 * @returns {{scanStart:number, scanEnd:number, quantTables:Array<{offset:number,precision:number}>}}
 */
export function inspectJpeg(bytes) {
  if (!bytes || bytes.length < 8 || bytes[0] !== 255 || bytes[1] !== 216) {
    throw new Error('Not a JPEG data stream.');
  }
  const quantTables = [];
  let pos = 2;
  while (pos + 4 < bytes.length) {
    if (bytes[pos] !== 255) throw new Error('Unexpected JPEG marker boundary.');
    while (bytes[pos] === 255) pos++;
    const marker = bytes[pos++];
    if (marker === 0xd9) break;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const size = (bytes[pos] << 8) | bytes[pos + 1];
    if (size < 2 || pos + size > bytes.length) throw new Error('Invalid JPEG marker length.');
    const end = pos + size;
    if (marker === 0xdb) {
      let cursor = pos + 2;
      while (cursor < end) {
        const precision = bytes[cursor] >>> 4;
        const count = precision === 0 ? 64 : precision === 1 ? 128 : -1;
        if (count < 0 || cursor + 1 + count > end) throw new Error('Malformed JPEG quantization table.');
        quantTables.push({ offset: cursor + 1, precision });
        cursor += 1 + count;
      }
    }
    if (marker === 0xda) {
      let scanEnd = bytes.length - 2;
      if (bytes[scanEnd] !== 255 || bytes[scanEnd + 1] !== 217) {
        scanEnd = -1;
        for (let i = bytes.length - 2; i > end; i--) {
          if (bytes[i] === 255 && bytes[i + 1] === 217) { scanEnd = i; break; }
        }
      }
      if (scanEnd <= end) throw new Error('JPEG end-of-image marker missing.');
      return { scanStart: end, scanEnd, quantTables };
    }
    pos = end;
  }
  throw new Error('JPEG start-of-scan marker missing.');
}

function jpegBytesFromDataURL(url) {
  if (!url.startsWith('data:image/jpeg;base64,')) throw new Error('Expected JPEG data.');
  const data = atob(url.slice('data:image/jpeg;base64,'.length));
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i);
  return bytes;
}

function jpegDataFromCanvas(image, quality) {
  const c = document.createElement('canvas');
  c.width = image.width; c.height = image.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  // JPEG does not encode alpha. Composite over white, rather than implicit black.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  const raw = document.createElement('canvas');
  raw.width = c.width; raw.height = c.height;
  raw.getContext('2d').putImageData(new ImageData(
    new Uint8ClampedArray(image.data), image.width, image.height), 0, 0);
  ctx.drawImage(raw, 0, 0);
  const pixels = ctx.getImageData(0, 0, c.width, c.height);
  return { pixels, url: c.toDataURL('image/jpeg', quality / 100) };
}

async function jpegToPixels(bytes, width, height) {
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }));
  try {
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  } finally {
    bitmap.close();
  }
}

function p5BinaryFacade(rng) {
  return {
    createImage: () => ({}),
    constrain: limit,
    floor: Math.floor,
    random: (lo, hi) => hi === undefined ? rng() * lo : lo + (hi - lo) * rng()
  };
}

/**
 * JPEG byte processing using the actual p5.glitch binary API.
 * The quantization adjustments use its custom updateBytes method; entropy
 * corruption uses randomBytes within the image-data region, not the header.
 */
export function bendJpegWithP5(jpegBytes, opts = {}) {
  const metadata = inspectJpeg(jpegBytes);
  const seed = Number(opts.seed ?? 1907) >>> 0;
  const rng = random(seed);
  const damage = limit(Number(opts.damage ?? 50) || 0, 0, 100) / 100;
  const density = limit(Number(opts.density ?? 50) || 0, 0, 100) / 100;
  const pressure = limit(Number(opts.quantization ?? 42) || 0, 0, 100) / 100;
  const entropy = opts.entropy !== false;
  const quantize = opts.quantize !== false;
  const engine = new Glitch(p5BinaryFacade(rng));
  engine.loadBytes(Uint8Array.from(jpegBytes));
  const length = jpegBytes.length;
  const start = Math.min(metadata.scanEnd - 1, metadata.scanStart + 16);
  engine.limitBytes(start / length, (metadata.scanEnd - 1) / length);
  if (entropy && damage > 0 && density > 0 && start < metadata.scanEnd - 2) {
    const count = Math.max(1, Math.round((2 + 28 * density) * damage));
    // The original library performs deterministic corruption within this
    // protected interval. Non-marker replacement reduces decode failures.
    const replacement = 0x20 + Math.floor(rng() * 0xb0);
    engine.randomBytes(Math.min(count, 40), replacement);
  }
  if (quantize && pressure > 0 && damage > 0 && density > 0) {
    const mutated = Uint8Array.from(engine.bytesGlitched);
    for (const table of metadata.quantTables) {
      if (table.precision !== 0) continue;
      for (let index = 0; index < 64; index++) {
        if (rng() < pressure * density * (0.32 + 0.65 * damage)) {
          const offset = table.offset + index;
          const raw = mutated[offset];
          const factor = 0.18 + rng() * (1.5 + 4 * pressure * damage);
          mutated[offset] = limit(Math.round(raw * factor), 1, 255);
        }
      }
    }
    engine.updateBytes(mutated);
  }
  return Uint8Array.from(engine.bytesGlitched);
}

async function decodedOrNull(bytes, width, height) {
  try { return await jpegToPixels(bytes, width, height); }
  catch { return null; }
}

/**
 * @returns {Promise<{width:number,height:number,data:Uint8ClampedArray,jpegBytes:Uint8Array|null,warning:string}>}
 */
export async function glitchJpeg(image, opts = {}) {
  if (!image || !Number.isSafeInteger(image.width) || !Number.isSafeInteger(image.height) ||
      image.width < 1 || image.height < 1 || image.width * image.height > 4_000_000 ||
      !image.data || image.data.length !== image.width * image.height * 4) {
    throw new TypeError('Expected valid RGBA image data (maximum 4 megapixels).');
  }
  const mode = JPEG_MODES.includes(opts.mode) ? opts.mode : 'jpeg-hybrid';
  const seed = Number(opts.seed ?? 1907) >>> 0;
  const quality = limit(Math.round(Number(opts.quality ?? 70) || 70), 5, 99);
  const damage = limit(Number(opts.damage ?? 55) || 0, 0, 100);
  const density = limit(Number(opts.density ?? 50) || 0, 0, 100);
  const iterations = limit(Math.round(Number(opts.iterations ?? 12) || 12), 1, 36);
  const quantization = limit(Number(opts.quantization ?? 40) || 0, 0, 100);
  const source = jpegDataFromCanvas(image, quality);
  let jpegBytes = jpegBytesFromDataURL(source.url);
  let warning = '';
  if (damage === 0 || density === 0) {
    return { width: image.width, height: image.height, data: source.pixels.data,
      jpegBytes, warning };
  }

  if (mode === 'jpeg-hybrid' || mode === 'jpeg-canvas') {
    let succeeded = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = await glitchCanvas({
          seed: (seed + 13 * attempt) % 100,
          quality,
          amount: limit(Math.round(damage * (1 - attempt * 0.3)), 1, 99),
          iterations: Math.max(1, Math.round(iterations * (1 - attempt * 0.35)))
        }).fromImageData(source.pixels).toDataURL();
        const candidate = jpegBytesFromDataURL(url);
        if (await decodedOrNull(candidate, image.width, image.height)) {
          jpegBytes = candidate; succeeded = true; break;
        }
      } catch { /* Bad entropy may not decode; retry at lower intensity. */ }
    }
    if (!succeeded) warning = 'glitch-canvas output could not be decoded; kept the original JPEG stage.';
  }

  if (mode === 'jpeg-hybrid' || mode === 'jpeg-entropy' || mode === 'jpeg-quant') {
    let succeeded = false;
    const entropy = mode !== 'jpeg-quant';
    const quantize = mode !== 'jpeg-entropy';
    const previous = jpegBytes;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const candidate = bendJpegWithP5(previous, {
          seed: seed + attempt * 977,
          damage: damage * (1 - attempt * 0.4),
          density,
          quantization,
          entropy: entropy && attempt < 2,
          quantize
        });
        if (await decodedOrNull(candidate, image.width, image.height)) {
          jpegBytes = candidate; succeeded = true; break;
        }
      } catch { /* Reset to previous known-good stage. */ }
    }
    if (!succeeded) {
      warning = [warning, 'p5.glitch output could not be decoded; kept the last valid JPEG stage.']
        .filter(Boolean).join(' ');
    }
  }
  const finalPixels = await decodedOrNull(jpegBytes, image.width, image.height);
  if (!finalPixels) throw new Error('JPEG render failed. Lower damage or reseed.');
  return { width: image.width, height: image.height, data: finalPixels.data, jpegBytes, warning };
}

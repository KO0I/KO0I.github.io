/**
 * PNG Glitch Studio — browser-independent raster databending.
 * Inspired by the visual results of PNG scanline filter failures, not a port
 * of PNGlitch. Output is ordinary RGBA; the browser encodes a valid PNG.
 * @license MIT
 */
export const MODES = Object.freeze(['decoder', 'tear', 'sort', 'spectrum', 'collapse']);

export function random(seed) {
  let s = Number(seed) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const pick = (rng, n) => Math.floor(rng() * n);
const paeth = (a, b, c) => {
  const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
  return da <= db && da <= dc ? a : db <= dc ? b : c;
};
function predictor(kind, a, b, c) {
  switch (kind) {
    case 1: return a;
    case 2: return b;
    case 3: return (a + b) >>> 1;
    case 4: return paeth(a, b, c);
    default: return 0;
  }
}

function decoderFault(dst, src, w, h, strength, density, rng) {
  if (w < 2 || h < 3) return;
  const stride = w * 4;
  const passes = Math.max(1, Math.round(h * density / 85));
  for (let pass = 0; pass < passes; pass++) {
    const top = 1 + pick(rng, h - 1);
    const bottom = Math.min(h, top + 2 + pick(rng, Math.max(1, Math.round(h * strength / 4))));
    const x0 = pick(rng, w);
    const x1 = Math.min(w, x0 + Math.max(2, Math.round(w * (0.08 + rng() * strength * 0.9))));
    const written = pick(rng, 5);
    const read = (written + 1 + pick(rng, 4)) % 5;
    const bitError = rng() < 0.28 ? (1 << pick(rng, 8)) : 0;
    for (let y = top; y < bottom; y++) {
      for (let x = x0; x < x1; x++) {
        const i = y * stride + x * 4;
        for (let c = 0; c < 3; c++) {
          const left = x > 0 ? src[i - 4 + c] : 0;
          const above = src[i - stride + c];
          const upperLeft = x > 0 ? src[i - stride - 4 + c] : 0;
          const filtered = (src[i + c] - predictor(written, left, above, upperLeft)) & 255;
          // Reconstruct with the wrong PNG predictor; use the damaged prior row.
          const a = x > 0 ? dst[i - 4 + c] : 0;
          const b = dst[i - stride + c];
          const corner = x > 0 ? dst[i - stride - 4 + c] : 0;
          dst[i + c] = ((filtered ^ bitError) + predictor(read, a, b, corner)) & 255;
        }
      }
    }
  }
}

function scanlineTear(dst, w, h, strength, density, rng) {
  if (w < 2 || h < 1) return;
  const source = dst.slice();
  const count = Math.max(1, Math.round((h / 12 + 1) * density));
  for (let n = 0; n < count; n++) {
    const y0 = pick(rng, h);
    const rows = 1 + pick(rng, Math.max(1, Math.floor(2 + h * 0.035 * strength)));
    const dx = (rng() < 0.5 ? -1 : 1) * (1 + pick(rng, Math.max(1, Math.floor(w * 0.38 * strength))));
    for (let y = y0; y < Math.min(h, y0 + rows); y++) {
      for (let x = 0; x < w; x++) {
        const from = 4 * (y * w + ((x + dx % w + w) % w));
        const to = 4 * (y * w + x);
        for (let c = 0; c < 3; c++) dst[to + c] = source[from + c];
      }
    }
  }
}

function pixelSort(dst, w, h, strength, density, rng) {
  if (w < 4 || !h) return;
  const count = Math.max(1, Math.round(h * density * 0.22));
  for (let n = 0; n < count; n++) {
    const y = pick(rng, h);
    const x0 = pick(rng, w - 3);
    const size = Math.min(w - x0, Math.max(4, Math.round(4 + w * strength * (0.06 + rng() * 0.7))));
    const pixels = [];
    for (let x = x0; x < x0 + size; x++) {
      const i = (y * w + x) * 4;
      const r = dst[i], g = dst[i + 1], b = dst[i + 2];
      pixels.push({ r, g, b, lum: r * 0.2126 + g * 0.7152 + b * 0.0722 });
    }
    pixels.sort((a, b) => a.lum - b.lum);
    if (rng() < 0.5) pixels.reverse();
    for (let x = x0; x < x0 + size; x++) {
      const i = (y * w + x) * 4, p = pixels[x - x0];
      dst[i] = p.r; dst[i + 1] = p.g; dst[i + 2] = p.b;
    }
  }
}

function channelDrift(dst, w, h, strength, density, rng) {
  if (w < 3) return;
  const source = dst.slice();
  const segments = Math.max(1, Math.round(h * density / 12));
  const max = Math.max(1, Math.floor(w * strength * 0.075));
  for (let n = 0; n < segments; n++) {
    const top = pick(rng, h), rows = 1 + pick(rng, Math.max(1, Math.round(h * 0.12 * strength)));
    const dr = 1 + pick(rng, max), db = 1 + pick(rng, max);
    for (let y = top; y < Math.min(h, top + rows); y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        dst[i] = source[(y * w + Math.max(0, x - dr)) * 4];
        dst[i + 2] = source[(y * w + Math.min(w - 1, x + db)) * 4 + 2];
      }
    }
  }
}

function blockEcho(dst, w, h, strength, density, rng) {
  if (w < 2 || h < 2) return;
  const source = dst.slice();
  const count = Math.max(1, Math.round(4 + 48 * density));
  for (let n = 0; n < count; n++) {
    const x0 = pick(rng, w), y0 = pick(rng, h);
    const bw = 1 + pick(rng, Math.max(1, Math.floor(w * strength * 0.28)));
    const bh = 1 + pick(rng, Math.max(1, Math.floor(h * strength * 0.16)));
    const sx = Math.floor((rng() - 0.5) * w * 0.35 * strength);
    const sy = Math.floor((rng() - 0.5) * h * 0.15 * strength);
    for (let y = y0; y < Math.min(h, y0 + bh); y++) {
      for (let x = x0; x < Math.min(w, x0 + bw); x++) {
        const i = (y * w + x) * 4;
        const j = (clamp(y + sy, 0, h - 1) * w + clamp(x + sx, 0, w - 1)) * 4;
        dst[i] = source[j]; dst[i + 1] = source[j + 1]; dst[i + 2] = source[j + 2];
      }
    }
  }
}

/** @returns {{width:number,height:number,data:Uint8ClampedArray}} */
export function glitchImage(image, options = {}) {
  const { width: w, height: h, data } = image ?? {};
  if (!Number.isSafeInteger(w) || !Number.isSafeInteger(h) || w < 1 || h < 1 ||
      w * h > 16_777_216 || !data || data.length !== w * h * 4) {
    throw new TypeError('Expected RGBA image data with valid dimensions (maximum 16 megapixels).');
  }
  const mode = MODES.includes(options.mode) ? options.mode : 'collapse';
  const intensity = clamp(Number(options.intensity ?? 55) || 0, 0, 100) / 100;
  const density = clamp(Number(options.density ?? 50) || 0, 0, 100) / 100;
  const out = new Uint8ClampedArray(data);
  if (!intensity || !density) return { width: w, height: h, data: out };
  const rng = random(options.seed ?? 1907);
  if (mode === 'decoder' || mode === 'collapse') decoderFault(out, data, w, h, intensity, density, rng);
  if (mode === 'tear' || mode === 'collapse') scanlineTear(out, w, h, intensity, density, rng);
  if (mode === 'sort' || mode === 'collapse') pixelSort(out, w, h, intensity, density, rng);
  if (mode === 'spectrum' || mode === 'collapse') channelDrift(out, w, h, intensity, density, rng);
  if (mode === 'collapse') blockEcho(out, w, h, intensity, density, rng);
  // Corruption changes colors, not transparency. Keep the original alpha mask.
  for (let i = 3; i < out.length; i += 4) out[i] = data[i];
  return { width: w, height: h, data: out };
}

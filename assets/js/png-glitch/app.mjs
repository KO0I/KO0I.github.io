import { glitchJpeg } from './jpeg-engine.mjs';
import { glitchImage } from './engine.mjs';

const root = document.getElementById('pg-studio');
if (root) {
  const find = id => root.querySelector('#' + id);
  const canvas = find('pg-preview');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const original = document.createElement('canvas');
  const sourceCtx = original.getContext('2d', { willReadFrequently: true });
  const fileInput = find('pg-file');
  const mode = find('pg-mode');
  const codec = find('pg-codec');
  const jpegFields = find('pg-jpeg-fields');
  const quality = find('pg-quality');
  const iterations = find('pg-iterations');
  const quantization = find('pg-quantization');
  const jpegExport = find('pg-download-jpeg');
  const rawExport = find('pg-download-raw');
  const damage = find('pg-damage');
  const density = find('pg-density');
  const seed = find('pg-seed');
  const status = find('pg-status');
  const compare = find('pg-compare');
  const download = find('pg-download');
  const drop = find('pg-drop');
  const presets = {
    decoder: 'Incorrect PNG scanline filter reconstruction makes cascading color errors.',
    tear: 'Displaced scanlines stagger parts of the image.',
    sort: 'Luminance sorting stretches pixel colors into streaks.',
    spectrum: 'Misaligned red and blue channels split the image.',
    collapse: 'A combination of scanline errors, sorting, displacement and channel drift.'
  };
  let imageName = 'demo';
  let sourcePixels = null;
  let resultPixels = null;
  let comparing = false;
  let queued = false;
  let uploadSequence = 0;
  let generation = 0;
  let renderTimer = null;
  let jpegBytes = null;
  let imageNote = '';
  const jpegModes = {
    'jpeg-hybrid': ['Hybrid · both libraries', 'glitch-canvas corruption followed by p5.glitch entropy and quantization effects.'],
    'jpeg-canvas': ['glitch-canvas', 'Seeded JPEG entropy corruption with glitch-canvas.'],
    'jpeg-entropy': ['p5.glitch · entropy', 'Mutate JPEG compressed scan data with p5.glitch.'],
    'jpeg-quant': ['p5.glitch · quantization', 'Distort JPEG DCT quantization tables with p5.glitch.']
  };
  const pngModes = [...mode.options].map(o => ({ value: o.value, label: o.textContent }));

  function setStatus(message) { status.textContent = message; }
  function updateCodec() {
    const jpeg = codec.value === 'jpeg';
    const oldMode = mode.value;
    mode.replaceChildren();
    const choices = jpeg
      ? Object.entries(jpegModes).map(([value, [label]]) => ({ value, label }))
      : pngModes;
    for (const choice of choices) {
      const option = document.createElement('option');
      option.value = choice.value;
      option.textContent = choice.label;
      mode.appendChild(option);
    }
    mode.value = choices.some(o => o.value === oldMode) ? oldMode : jpeg ? 'jpeg-hybrid' : 'collapse';
    jpegFields.hidden = !jpeg;
    jpegExport.hidden = !jpeg;
    rawExport.hidden = !jpeg;
    find('pg-output-kind').textContent = jpeg ? 'OUTPUT / JPEG DATABEND' : 'OUTPUT / PNG RASTER';
    updateControls();
  }
  function updateControls() {
    find('pg-damage-value').textContent = damage.value + '%';
    find('pg-density-value').textContent = density.value + '%';
    find('pg-quality-value').textContent = quality.value + '%';
    find('pg-iterations-value').textContent = iterations.value;
    find('pg-quantization-value').textContent = quantization.value + '%';
    find('pg-mode-help').textContent = jpegModes[mode.value]?.[1] || presets[mode.value] || '';
    iterations.disabled = mode.value === 'jpeg-entropy' || mode.value === 'jpeg-quant';
    quantization.disabled = mode.value === 'jpeg-canvas' || mode.value === 'jpeg-entropy';
  }
  function setExportState(ready) {
    download.disabled = !ready;
    jpegExport.disabled = !ready || codec.value !== 'jpeg';
    rawExport.disabled = !ready || codec.value !== 'jpeg' || !jpegBytes;
  }
  function setDimensions(width, height) {
    original.width = canvas.width = width;
    original.height = canvas.height = height;
    find('pg-size').textContent = width + ' × ' + height;
  }
  function drawPreview() {
    if (!sourcePixels || !resultPixels) return;
    ctx.putImageData(comparing ? sourcePixels : resultPixels, 0, 0);
  }
  async function regenerate(version) {
    queued = false;
    if (!sourcePixels || version !== generation) return;
    try {
      let result;
      const args = {
        mode: mode.value, intensity: Number(damage.value), damage: Number(damage.value),
        density: Number(density.value), seed: Number(seed.value) >>> 0,
        quality: Number(quality.value), iterations: Number(iterations.value),
        quantization: Number(quantization.value)
      };
      if (codec.value === 'jpeg') {
        setStatus('Glitching compressed JPEG locally…');
        result = await glitchJpeg(sourcePixels, args);
      } else {
        result = glitchImage(sourcePixels, args);
      }
      if (version !== generation) return;
      jpegBytes = result.jpegBytes || null;
      resultPixels = new ImageData(new Uint8ClampedArray(result.data), result.width, result.height);
      drawPreview();
      setExportState(true);
      setStatus([imageName, 'seed ' + args.seed, imageNote, result.warning].filter(Boolean).join(' · '));
    } catch (error) {
      if (version !== generation) return;
      resultPixels = null;
      jpegBytes = null;
      setExportState(false);
      setStatus('Cannot render image: ' + (error?.message || error));
    }
  }
  function queueRender() {
    updateControls();
    const version = ++generation;
    clearTimeout(renderTimer);
    jpegBytes = null;
    setExportState(false);
    if (codec.value === 'jpeg') {
      renderTimer = setTimeout(() => void regenerate(version), 250);
    } else {
      requestAnimationFrame(() => void regenerate(version));
    }
  }
  function makeDemo() {
    setDimensions(1000, 640);
    const w = original.width, h = original.height;
    const gradient = sourceCtx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#0f1932');
    gradient.addColorStop(0.5, '#6a315d');
    gradient.addColorStop(1, '#d77281');
    sourceCtx.fillStyle = gradient;
    sourceCtx.fillRect(0, 0, w, h);
    sourceCtx.fillStyle = '#0d0c1d';
    sourceCtx.beginPath();
    sourceCtx.moveTo(0, 450); sourceCtx.lineTo(270, 180);
    sourceCtx.lineTo(480, 450); sourceCtx.lineTo(630, 330);
    sourceCtx.lineTo(1000, 560); sourceCtx.lineTo(1000, 640);
    sourceCtx.lineTo(0, 640); sourceCtx.fill();
    sourceCtx.fillStyle = '#59c6d7';
    sourceCtx.beginPath(); sourceCtx.arc(745, 232, 134, 0, Math.PI * 2); sourceCtx.fill();
    sourceCtx.fillStyle = '#ff9eab';
    sourceCtx.beginPath(); sourceCtx.arc(745, 232, 78, 0, Math.PI * 2); sourceCtx.fill();
    for (let i = 0; i < 95; i++) {
      sourceCtx.fillStyle = i % 4 ? '#f2c3d5' : '#31c3c6';
      sourceCtx.globalAlpha = (i % 5 + 2) / 8;
      sourceCtx.fillRect((i * 131 + 79) % w, (i * 83 + 17) % h, i % 3 ? 62 : 200, 1 + i % 4);
    }
    sourceCtx.globalAlpha = 1;
    sourceCtx.fillStyle = '#f8d6e9';
    sourceCtx.font = 'bold 103px monospace'; sourceCtx.fillText('SIGNAL', 80, 390);
    sourceCtx.font = '26px monospace'; sourceCtx.fillText('RASTER / UNSTABLE', 86, 430);
    sourceCtx.fillStyle = '#69d9e1'; sourceCtx.fillRect(86, 447, 285, 9);
    imageName = 'demo';
    imageNote = '';
    sourcePixels = sourceCtx.getImageData(0, 0, w, h);
    queueRender();
  }
  async function loadFile(file) {
    if (!file) return;
    const token = ++uploadSequence;
    const inputFormat = ['image/png', 'image/jpeg'].includes(file.type)
      ? file.type : !file.type && /\.png$/i.test(file.name) ? 'image/png'
        : !file.type && /\.jpe?g$/i.test(file.name) ? 'image/jpeg' : null;
    if (!inputFormat) { setStatus('Only PNG and JPEG images are supported.'); return; }
    ++generation;
    setExportState(false);
    setStatus('Decoding image locally…');
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      if (token !== uploadSequence) { bitmap.close(); return; }
      const scale = Math.min(1, 2048 / bitmap.width, 2048 / bitmap.height,
        Math.sqrt(4_000_000 / (bitmap.width * bitmap.height)));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      setDimensions(width, height);
      sourceCtx.clearRect(0, 0, width, height);
      sourceCtx.drawImage(bitmap, 0, 0, width, height);
      sourcePixels = sourceCtx.getImageData(0, 0, width, height);
      imageName = file.name.replace(/\.[^.]+$/, '').slice(0, 72) || 'image';
      imageNote = scale < 1 ? 'resized to ' + width + ' × ' + height : '';
      codec.value = inputFormat === 'image/jpeg' ? 'jpeg' : 'png';
      updateCodec();
      queueRender();
    } catch (error) {
      setStatus('Unable to open this image. Try PNG or JPEG.');
    } finally {
      bitmap?.close();
    }
  }

  fileInput.addEventListener('change', () => loadFile(fileInput.files?.[0]));
  codec.addEventListener('change', () => { updateCodec(); queueRender(); });
  for (const control of [mode, damage, density, seed, quality, iterations, quantization]) control.addEventListener('input', queueRender);
  find('pg-reroll').addEventListener('click', () => {
    const values = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(values);
    else values[0] = Math.floor(Math.random() * 4294967296);
    seed.value = String(values[0]);
    queueRender();
  });
  find('pg-reset').addEventListener('click', () => {
    mode.value = codec.value === 'jpeg' ? 'jpeg-hybrid' : 'collapse';
    damage.value = '58'; density.value = '52'; seed.value = '1907';
    quality.value = '70'; iterations.value = '12'; quantization.value = '40';
    queueRender();
  });
  find('pg-demo').addEventListener('click', () => { uploadSequence++; fileInput.value = ''; makeDemo(); });
  function saveBlob(blob, suffix) {
    if (!blob) { setStatus('Export unavailable in this browser.'); return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = imageName.replace(/[^\w.-]/g, '-') + '-glitch-' +
      (Number(seed.value) >>> 0) + suffix;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  function exportSafe(type, suffix) {
    if (!resultPixels) return;
    const out = document.createElement('canvas');
    out.width = resultPixels.width; out.height = resultPixels.height;
    out.getContext('2d').putImageData(resultPixels, 0, 0);
    out.toBlob(blob => saveBlob(blob, suffix), type, 0.93);
  }
  download.addEventListener('click', () => exportSafe('image/png', '.png'));
  jpegExport.addEventListener('click', () => exportSafe('image/jpeg', '.jpg'));
  rawExport.addEventListener('click', () => {
    if (codec.value === 'jpeg' && jpegBytes)
      saveBlob(new Blob([jpegBytes], { type: 'image/jpeg' }), '-raw.jpg');
  });
  function startCompare(event) { if (event?.cancelable) event.preventDefault(); comparing = true; drawPreview(); }
  function endCompare() { comparing = false; drawPreview(); }
  compare.addEventListener('pointerdown', startCompare);
  window.addEventListener('pointerup', endCompare);
  window.addEventListener('pointercancel', endCompare);
  compare.addEventListener('keydown', event => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) startCompare(event);
  });
  compare.addEventListener('keyup', event => {
    if (event.key === ' ' || event.key === 'Enter') endCompare();
  });
  compare.addEventListener('blur', endCompare);
  for (const eventName of ['dragenter', 'dragover']) {
    drop.addEventListener(eventName, event => { event.preventDefault(); drop.classList.add('pg-dragging'); });
  }
  for (const eventName of ['dragleave', 'drop']) {
    drop.addEventListener(eventName, event => { event.preventDefault(); drop.classList.remove('pg-dragging'); });
  }
  drop.addEventListener('drop', event => loadFile(event.dataTransfer?.files?.[0]));
  document.addEventListener('paste', event => {
    if (!root.isConnected) return;
    const item = Array.from(event.clipboardData?.items || []).find(i => i.type.startsWith('image/'));
    if (item) { event.preventDefault(); loadFile(item.getAsFile()); }
  });
  updateCodec();
  makeDemo();
}

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

  function setStatus(message) { status.textContent = message; }
  function setDimensions(width, height) {
    original.width = canvas.width = width;
    original.height = canvas.height = height;
    find('pg-size').textContent = width + ' × ' + height;
  }
  function drawPreview() {
    if (!sourcePixels || !resultPixels) return;
    ctx.putImageData(comparing ? sourcePixels : resultPixels, 0, 0);
  }
  function regenerate() {
    queued = false;
    if (!sourcePixels) return;
    try {
      const result = glitchImage(sourcePixels, {
        mode: mode.value, intensity: Number(damage.value),
        density: Number(density.value), seed: Number(seed.value) >>> 0
      });
      resultPixels = new ImageData(result.data, result.width, result.height);
      drawPreview();
      download.disabled = false;
      setStatus(imageName + ' · seed ' + seed.value);
    } catch (error) {
      download.disabled = true;
      setStatus('Cannot render image: ' + error.message);
    }
  }
  function queueRender() {
    find('pg-damage-value').textContent = damage.value + '%';
    find('pg-density-value').textContent = density.value + '%';
    find('pg-mode-help').textContent = presets[mode.value] || '';
    if (!queued) {
      queued = true;
      requestAnimationFrame(regenerate);
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
    sourcePixels = sourceCtx.getImageData(0, 0, w, h);
    queueRender();
  }
  async function loadFile(file) {
    if (!file) return;
    const token = ++uploadSequence;
    if (!file.type.startsWith('image/')) { setStatus('Choose a PNG, JPEG, or WebP image.'); return; }
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
      queueRender();
      if (scale < 1) setStatus('Large image resized to ' + width + ' × ' + height + ' for browser performance.');
    } catch (error) {
      setStatus('Unable to open this image. Try PNG, JPEG, or WebP.');
    } finally {
      bitmap?.close();
    }
  }

  fileInput.addEventListener('change', () => loadFile(fileInput.files?.[0]));
  for (const control of [mode, damage, density, seed]) control.addEventListener('input', queueRender);
  find('pg-reroll').addEventListener('click', () => {
    const values = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) crypto.getRandomValues(values);
    else values[0] = Math.floor(Math.random() * 4294967296);
    seed.value = String(values[0]);
    queueRender();
  });
  find('pg-reset').addEventListener('click', () => {
    mode.value = 'collapse'; damage.value = '58'; density.value = '52'; seed.value = '1907';
    queueRender();
  });
  find('pg-demo').addEventListener('click', () => { uploadSequence++; fileInput.value = ''; makeDemo(); });
  download.addEventListener('click', () => {
    if (!resultPixels) return;
    // The preview is temporarily replaced when the user holds Compare.
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = resultPixels.width; exportCanvas.height = resultPixels.height;
    exportCanvas.getContext('2d').putImageData(resultPixels, 0, 0);
    exportCanvas.toBlob(blob => {
      if (!blob) { setStatus('PNG export is unavailable in this browser.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageName.replace(/[^\w.-]/g, '-') + '-glitch-' + seed.value + '.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, 'image/png');
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
  makeDemo();
}

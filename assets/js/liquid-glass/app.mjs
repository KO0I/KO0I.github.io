import { defaults, presets, fields, fitLens, clampPosition, exportSettings } from './settings.mjs';
import { GlassRenderer } from './renderer.mjs';

const $ = (id) => document.getElementById(`lg-${id}`);
const stage = $('stage');
const scene = $('scene-content');
const glass = $('glass');
const settings = { ...defaults };
let renderer;
let device;
let pixelRatio = 1;
let position = { x: 0, y: 0 };
let lens = fitLens(settings, stage.clientWidth, stage.clientHeight);
let ready = false;
let failed = false;
let frame = 0;
let captureVersion = 0;
let capturing = false;
let resizeTimer;
let observedSize = '';

function fail(message, error) {
  failed = true;
  ready = false;
  glass.hidden = true;
  $('center').disabled = true;
  $('status').textContent = message;
  if (error) console.error('Liquid Glass Lab:', error);
}

function draw() {
  if (frame || !ready || document.hidden) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (!ready) return;
    try { renderer.render({ x: position.x * pixelRatio, y: position.y * pixelRatio }, settings); }
    catch (error) { fail('Rendering stopped. Reload the page to try again.', error); }
  });
}

function place(next) {
  position = clampPosition(next, lens, { width: stage.clientWidth, height: stage.clientHeight });
  glass.style.left = `${position.x}px`;
  glass.style.top = `${position.y}px`;
  draw();
}

function sizeLens() {
  lens = fitLens(settings, stage.clientWidth, stage.clientHeight);
  glass.style.width = `${lens.width}px`;
  glass.style.height = `${lens.height}px`;
  glass.style.borderRadius = `${lens.radius}px`;
  glass.width = Math.max(1, Math.round(lens.width * pixelRatio));
  glass.height = Math.max(1, Math.round(lens.height * pixelRatio));
  place(position);
}

function centerLens() {
  place({ x: (stage.clientWidth - lens.width) / 2, y: (stage.clientHeight - lens.height) / 2 });
}

function syncControls() {
  for (const field of fields) {
    $(field.key).value = settings[field.key];
    const digits = String(field.step).split('.')[1]?.length || 0;
    $(`${field.key}-value`).value = `${settings[field.key].toFixed(digits)}${field.unit || ''}`;
  }
  $('json').value = JSON.stringify(exportSettings(settings), null, 2);
  $('export-status').textContent = '';
  sizeLens();
}

for (const field of fields) {
  const row = document.createElement('div');
  row.className = 'lg-field';
  const label = document.createElement('label');
  label.htmlFor = `lg-${field.key}`;
  label.append(field.label);
  const output = document.createElement('output');
  output.id = `lg-${field.key}-value`;
  output.htmlFor = `lg-${field.key}`;
  label.append(output);
  const input = document.createElement('input');
  Object.assign(input, { id: `lg-${field.key}`, type: 'range', min: field.min, max: field.max, step: field.step, value: settings[field.key] });
  input.addEventListener('input', () => {
    settings[field.key] = input.valueAsNumber;
    if (field.group === 'shape') $('shape').value = '';
    $('preset').value = 'custom';
    syncControls();
  });
  row.append(label, input);
  $(`${field.group}-fields`).append(row);
}

$('shape').addEventListener('change', () => {
  const shapes = { pill: [360, 144, 100], circle: [220, 220, 100], box: [320, 160, 0] };
  const dimensions = shapes[$('shape').value];
  if (!dimensions) return;
  [settings.width, settings.height, settings.roundness] = dimensions;
  $('preset').value = 'custom';
  syncControls();
});

$('controls').addEventListener('submit', (event) => event.preventDefault());
$('preset').addEventListener('change', () => {
  $('shape').value = '';
  Object.assign(settings, presets[$('preset').value]);
  syncControls();
});
$('reset').addEventListener('click', () => {
  $('shape').value = '';
  Object.assign(settings, defaults);
  $('preset').value = 'original';
  syncControls();
  centerLens();
});
$('center').addEventListener('click', centerLens);
$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('json').value);
    $('export-status').textContent = 'Settings copied.';
  } catch {
    $('json').closest('details').open = true;
    $('json').focus();
    $('json').select();
    $('export-status').textContent = 'Clipboard unavailable. Copy the selected JSON below.';
  }
});
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('json').value + '\n'], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'chipchirp-liquid-glass.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('export-status').textContent = 'Settings downloaded.';
});

let grab;
glass.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || grab) return;
  glass.focus({ preventScroll: true });
  glass.setPointerCapture(event.pointerId);
  grab = { id: event.pointerId, x: event.clientX - position.x, y: event.clientY - position.y };
});
glass.addEventListener('pointermove', (event) => {
  if (grab?.id === event.pointerId) place({ x: event.clientX - grab.x, y: event.clientY - grab.y });
});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  glass.addEventListener(name, (event) => {
    if (grab?.id !== event.pointerId) return;
    grab = null;
    if (glass.hasPointerCapture(event.pointerId)) glass.releasePointerCapture(event.pointerId);
  });
}
glass.addEventListener('keydown', (event) => {
  const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
  if (!direction) return;
  event.preventDefault();
  const step = event.shiftKey ? 20 : 5;
  place({ x: position.x + direction[0] * step, y: position.y + direction[1] * step });
});

async function capture() {
  if (!renderer || failed || capturing) return;
  capturing = true;
  try {
    let version;
    do {
      version = captureVersion;
      ready = false;
      glass.hidden = true;
      $('status').textContent = 'Capturing preview…';
      await document.fonts.ready;
      if (scene.dataset.scene === 'photo') await scene.querySelector('img').decode();
      const ratio = Math.min(devicePixelRatio || 1, 2, (device.limits.maxTextureDimension2D - 1) / Math.max(scene.offsetWidth, scene.offsetHeight));
      const snapshot = await window.html2canvas(scene, { backgroundColor: '#0f0e15', scale: ratio, logging: false });
      if (failed) return;
      if (version !== captureVersion) continue;
      renderer.showPage(snapshot);
      pixelRatio = ratio;
      sizeLens();
      ready = true;
      glass.hidden = false;
      $('status').textContent = 'WebGPU ready. Drag the lens or adjust a setting.';
      draw();
    } while (version !== captureVersion);
  } catch (error) {
    fail('Could not prepare the glass preview. Reload the page to try again.', error);
  } finally { capturing = false; }
}

function requestCapture() {
  captureVersion += 1;
  ready = false;
  glass.hidden = true;
  if (renderer && !failed) $('status').textContent = 'Capturing preview…';
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(capture, 160);
}
$('scene').addEventListener('change', () => {
  scene.dataset.scene = $('scene').value;
  requestCapture();
});
function captureOnResize() {
  const size = `${scene.offsetWidth}:${scene.offsetHeight}:${devicePixelRatio}`;
  if (size === observedSize) return;
  observedSize = size;
  requestCapture();
}
new ResizeObserver(captureOnResize).observe(scene);
window.addEventListener('resize', captureOnResize);
document.addEventListener('visibilitychange', draw);
window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  failed = true;
  ready = false;
  cancelAnimationFrame(frame);
  clearTimeout(resizeTimer);
  renderer?.destroy();
});

syncControls();
centerLens();

async function start() {
  if (!window.isSecureContext) {
    fail('WebGPU needs a secure connection. Open this page over HTTPS or localhost. Settings can still be exported.');
    return;
  }
  if (!navigator.gpu) {
    fail('WebGPU is unavailable in this browser. Try a browser with WebGPU and graphics acceleration enabled. Settings can still be exported.');
    return;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { fail('No WebGPU adapter is available. Check browser graphics acceleration. Settings can still be exported.'); return; }
    device = await adapter.requestDevice();
    device.lost.then((info) => {
      if (info.reason !== 'destroyed') fail('The graphics device was lost. Reload the page to restore the preview.');
    });
    device.addEventListener('uncapturederror', (event) => fail('The graphics device could not render the glass. Reload to try again.', event.error));
    renderer = await GlassRenderer.create(device, glass);
    await document.fonts.ready;
    const headline = document.createRange();
    headline.selectNodeContents(scene.querySelector('h3'));
    const textBox = headline.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    place({
      x: textBox.left - stageBox.left + (textBox.width - lens.width) / 2,
      y: textBox.top - stageBox.top + (textBox.height - lens.height) / 2,
    });
    await capture();
  } catch (error) {
    fail('WebGPU could not start. Check browser graphics acceleration and reload. Settings can still be exported.', error);
  }
}
void start();

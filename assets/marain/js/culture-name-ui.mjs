/* Culture-style name workbench; fetches same-origin source, generates in browser. */
import { createCultureNameGenerator, parseCultureNameCorpus } from './culture-name-generator.mjs';

const root = document.getElementById('culture-names');
if (root) {
  const $ = id => root.querySelector('#' + id);
  const style = $('culture-name-style');
  const count = $('culture-name-count');
  const seed = $('culture-name-seed');
  const output = $('culture-name-results');
  const status = $('culture-name-status');
  const sourceSearch = $('culture-name-search');
  const sourceResults = $('culture-source-results');
  const sourceStatus = $('culture-source-status');
  const prev = $('culture-source-prev');
  const next = $('culture-source-next');
  const generateButton = $('culture-name-generate');
  const shuffleButton = $('culture-name-shuffle');
  const copyButton = $('culture-name-copy');
  const PAGE_SIZE = 60;
  let names = [];
  let generator = null;
  let generated = [];
  let page = 0;

  function newSeed() {
    if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      const numbers = new Uint32Array(2);
      globalThis.crypto.getRandomValues(numbers);
      return numbers[0].toString(36) + '-' + numbers[1].toString(36);
    }
    return Math.floor(Math.random() * 0xFFFFFFFF).toString(36) + '-' + Date.now().toString(36);
  }

  function generate() {
    if (!generator) return;
    const selectedSeed = seed.value.trim() || newSeed();
    seed.value = selectedSeed;
    generated = generator.generate({
      style: style.value,
      count: Number(count.value),
      seed: selectedSeed
    });
    output.replaceChildren(...generated.map(name => {
      const item = document.createElement('li');
      item.textContent = name; // Names are always treated as plain text, never HTML.
      return item;
    }));
    copyButton.disabled = generated.length === 0;
    status.textContent = 'Generated ' + generated.length +
      ' invented names from ' + generator.sourceCount + ' reference entries. Seed: ' + selectedSeed + '.';
  }

  function renderSources() {
    const needle = sourceSearch.value.trim().toLocaleLowerCase();
    const filtered = names.filter(name => name.toLocaleLowerCase().includes(needle));
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    page = Math.min(page, pages - 1);
    const start = page * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);
    sourceResults.replaceChildren(...visible.map(name => {
      const item = document.createElement('li');
      item.textContent = name;
      return item;
    }));
    sourceStatus.textContent = filtered.length
      ? 'Showing ' + (start + 1) + '–' + (start + visible.length) + ' of ' +
        filtered.length + ' matching names (' + names.length + ' total).'
      : 'No names match. ' + names.length + ' reference entries are available.';
    prev.disabled = page === 0;
    next.disabled = page >= pages - 1;
  }

  generateButton.addEventListener('click', generate);
  shuffleButton.addEventListener('click', () => { seed.value = newSeed(); generate(); });
  copyButton.addEventListener('click', async () => {
    if (!generated.length) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(generated.join('\n'));
      status.textContent = 'Copied generated names. These are invented, not attested.';
    } catch (_) {
      status.textContent = 'Clipboard unavailable. Select and copy the names manually.';
    }
  });
  sourceSearch.addEventListener('input', () => { page = 0; renderSources(); });
  prev.addEventListener('click', () => { if (page > 0) { page -= 1; renderSources(); } });
  next.addEventListener('click', () => { page += 1; renderSources(); });

  try {
    const response = await fetch(root.dataset.corpusUrl, {credentials: 'same-origin'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    names = parseCultureNameCorpus(await response.text());
    generator = createCultureNameGenerator(names);
    generateButton.disabled = shuffleButton.disabled = false;
    sourceSearch.disabled = false;
    renderSources();
    generate();
  } catch (error) {
    status.textContent = 'The name list could not be loaded. The reference-text link is still available.';
    sourceStatus.textContent = 'Source list unavailable here; try the plain-text link.';
    console.warn('Culture name corpus load failed:', error);
  }
}

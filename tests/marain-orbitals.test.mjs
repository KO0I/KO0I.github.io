import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const raw = read('assets/marain/culture-orbital-names.txt').trim().split(/\r?\n/u);
const data = JSON.parse(read('assets/marain/culture-orbital-data.json'));
const page = read('_pages/marain.markdown');
const tabs = read('assets/marain/js/marain-tabs.js');
const ui = read('assets/marain/js/culture-orbitals-ui.js');

test('retain original primary list without conflating Broatsa and Broat', () => {
  assert.equal(raw.length, 19);
  assert.equal(new Set(raw).size, 19);
  assert.equal(raw[0], 'Codure');
  assert.equal(raw.at(-1), 'Broatsa (Phage Rock)');
  assert.equal(raw.slice(0, -1).length, 18);
  assert.ok(raw.includes('Masaq’'));
  assert.ok(raw.includes('Spanshacht-Trouferre'));
  assert.ok(data.count_note.includes('17-name'));
  assert.ok(data.count_note.includes('18 standalone names'));
  assert.equal(data.confirmed.length, 19);
  assert.deepEqual(data.confirmed.slice(0,-1).map(x=>x.name), raw.slice(0,-1));
  assert.equal(data.confirmed.at(-1).name, 'Broat');
  assert.equal(data.confirmed.at(-1).origin_form, 'Broatsa');
  assert.equal(data.confirmed.at(-1).star_system, 'Kwins');
  assert.equal(data.confirmed.at(-1).also_known_as, 'Phage Rock');
});

test('additional names remain clues rather than confirmed Orbital names', () => {
  assert.equal(data.origin_clues.length, 16);
  assert.ok(data.origin_clues.every(x=>x.category));
  const confirmed = new Set(data.confirmed.map(x=>x.name));
  for (const word of ['Eucher', 'Thantap', 'Kepile', 'Inias', 'Frulte', 'Rabaroan', 'Preon', 'Lepoort', 'Braij', 'Beldrun', 'Sintrier', 'Sichult']) {
    assert.equal(confirmed.has(word), false, word);
  }
  assert.ok(data.origin_clues.filter(x=>x.category==='unresolved').length >= 5);
});

test('full source examples and classification caveats are preserved', () => {
  const byForm = s => data.origin_clues.find(x=>x.origin_form===s);
  assert.equal(byForm('Bahlln-Euchersa').example,
    'Bahlln-Euchersa Wrobich Vress Schennil dam Flaysse');
  assert.equal(byForm('Grice-Thantapsa').example,
    'Grice-Thantapsa Li Brase ’ndane dam Sione');
  assert.equal(byForm('Gart-Kepilesa').example,
    'Gart-Kepilesa Zreyn Enhoff Tramow Afayaf dam Niskat-west');
  assert.equal(byForm('Sholz-Iniassa').example,
    'Sholz-Iniassa Jerle Ruule Batra dam Ilyon');
  assert.equal(byForm('Prebeign-Frultesa').example,
    'Prebeign-Frultesa Yime Leutze Nsokyi dam Volsh');
  assert.equal(byForm('Parharengyisa').category, 'speculative');
  assert.equal(byForm('Tursensa Ngaroe').category, 'variant');
  assert.equal(byForm('Tursensa Ngaroe').example, 'Tursensa Ngaroe Hgan QiRia dam Yutton');
  assert.equal(byForm('Stafl-Preonsa').second_type.includes('not confirmed'), true);
  assert.equal(byForm('Stafl-Lepoortsa').second_type, 'Plate');
  assert.equal(byForm('Juboal-Rabaroansa').first_type, 'stellar system');
  assert.equal(byForm('Juboal-Rabaroansa').second_type, 'Plate');
  assert.equal(byForm('Juboal-Rabaroansa').resident, 'Perosteck Balveda');
  assert.equal(byForm('Juboal-Rabaroansa').author_full_name,
    'Juboal-Rabaroansa Perosteck Alseyn Balveda dam T’seif');
  assert.equal(byForm('Quyn-Sichultsa').second_type, 'planet');
  assert.ok(data.origin_clues.some(x=>x.resident==='Ulver Seich' && x.category==='exception'));
  assert.ok(data.exclusions.some(x=>x.person==='Klatsli Quike' && x.origin_form==='Astle-Chulinisa'));
  assert.ok(data.rules.some(x=>x.includes('suffix')));
  assert.ok(data.rules.some(x=>x.includes('Gzilt')));
});

test('tab integrates with existing tools, source is readable without JavaScript', () => {
  assert.ok(page.includes('id="culture-orbitals"'));
  assert.ok(page.includes('culture-orbitals-ui.js'));
  assert.ok(page.includes('culture-orbital-data.json'));
  assert.ok(page.includes('culture-orbital-names.txt'));
  assert.ok(page.includes('id="culture-orbital-confirmed"'));
  assert.ok(page.includes('id="culture-orbital-origin-rows"'));
  assert.ok(page.includes('id="culture-orbital-status-filter"'));
  assert.ok(page.includes("A Few Notes on the Culture"));
  assert.ok(tabs.includes("tabNames.push('Orbitals & Habs')"));
  assert.ok(tabs.includes('panels[1 + namesOffset].append(orbitals)'));
  assert.ok(tabs.includes('panels[1 + namesOffset + orbitalOffset].append(words)'));
  assert.ok(!tabs.includes("tabNames.push('Poetry')"));
  assert.ok(ui.includes('textContent'));
  assert.ok(!ui.includes('.innerHTML'));
});

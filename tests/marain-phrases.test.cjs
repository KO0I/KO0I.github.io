const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const scope = {};
vm.createContext(scope);
for (const name of ['dict','alpha']) vm.runInContext(fs.readFileSync(path.join(root,`assets/marain/js/${name}.js`),'utf8'),scope);
const api = require('../assets/marain/js/phrase-translator.js')(scope.dict,scope.alpha);
const tr = s => api.translate(s);

test('lesson-derived clauses preserve grammatical roles', () => {
  const cases = [
    ['I speak Marain.', "ra'yuh kabo maraynva."],
    ['I meet your friend.', "ra'yuh gore ivemiva dam ge."],
    ['I give a flower to you.', "ra'yuh yafshpen lomrava gevihl."],
    ['I am in a spaceship.', "ra'yuh sayno prenli."],
    ['Do you speak Marain?', 'hanggra geyuh kabo maraynva?'],
    ['Is it true that you speak Marain?', 'hanggra geyuh kabo maraynva?'],
    ['I ride aboard a spaceship.', "ra'yuh zawen prenva."],
    ['The spaceship senses 3 humans.', 'prenuh lemih dosa dam uprayheva.']
  ];
  cases.forEach(([en,out])=>assert.equal(tr(en).roman,out,en));
});

test('possession differs from holding and hoarding',()=>{
  assert.equal(tr('I have a flower.').roman,"yesayn lomra'yuh ra'ye.");
  assert.equal(tr('I hold a flower.').roman,"ra'yuh yaf lomrava.");
  assert.equal(tr('I hoard flowers.').roman,"ra'yuh bahllavecht lomrava.");
  assert.equal(tr('Do you have a flower?').roman,"hanggra yesayn lomra'yuh geye?");
  assert.notEqual(tr('I have eaten food.').mode,'draft');
});

test('literal unknowns survive output and retain the English span',()=>{
  for(const en of ['I eat pizza.','Zorb eats food.','I frobnicate flowers.']){
    const r=tr(en);assert.ok(r.roman.includes('<??>'));assert.ok(r.glyphs.includes('<??>'));assert.equal(r.mode,'partial');assert.ok(r.missing.length);
  }
  assert.equal(tr('I eat pizza.').roman,"ra'yuh nadek <??>.");
  assert.deepEqual(tr('I eat pizza.').missing,['pizza']);
  assert.ok(tr('spaceshipper').missing.includes('spaceshipper'));
});

test('unsupported grammar and ambiguity do not masquerade as full translation',()=>{
  for(const en of ['I can speak Marain.','I do not eat flowers.','If I speak you listen.','I am happy.','I have eaten food.'])assert.equal(tr(en).mode,'partial',en);
  assert.equal(tr('name').roman,'<??>'); // noun name and verb name need context
  assert.equal(tr('I speak Marain and eat food.').mode,'partial');
  assert.ok(tr('I can speak Marain.').notes.some(n=>n.includes('No case endings')));
});

test('longest phrase and English inflections are exact, not substring guesses',()=>{
  assert.equal(tr('special circumstances').roman,'raygihvihlst');
  assert.equal(tr('I eat vegetables.').roman,"ra'yuh nadek pantshayva.");
  assert.equal(tr('I meet friends.').roman,"ra'yuh gore ivemiva.");
  assert.equal(tr('incorrectness').roman,'<??>');
});

test('attested examples remain distinguished from assembled drafts',()=>{
  assert.equal(tr('What is your name?').roman,"shay sein'gafva datsha gevihl?");
  assert.equal(tr("I don't do drugs.").mode,'attested');
  assert.equal(tr('I am doing well.').mode,'attested');
  assert.equal(tr('The Mind speaks Marain to me like a friend.').roman,'raymuhreruh kabo maraynva ravihl yokay ivemi.');
  assert.equal(tr('I give a flower to you.').mode,'draft');
});

test('pronoun defaults and case allomorphs use glyph vowels',()=>{
  assert.equal(tr('She speaks Marain.').roman,'toyuh kabo maraynva.');
  assert.equal(tr('They speak Marain.').roman,'wuhyuh kabo maraynva.');
  assert.equal(tr('You all speak Marain.').roman,'llayyuh kabo maraynva.');
  assert.equal(api.inflect('lA','nom'),'lAyu');
  assert.equal(api.inflect('pren','nom'),'prenu');
});

test('decimal values convert to base eight, including large exact integers',()=>{
  assert.equal(tr('8 9 10').roman,'stonhech stosto stohre');
  assert.equal(tr('eight nine ten').roman,'stonhech stosto stohre');
  assert.equal(api.numberKey('32768'),'stonheHnheHnheHnheHnheH');
  assert.equal(tr('there are 8 spaceships').roman,'yesayn stonhech dam prenuh');
  assert.equal(api.numberKey('1.5'),null);
});

test('multiple sentences, empty input, and long input are bounded',()=>{
  assert.equal(tr('I speak Marain. I eat pizza.').roman,"ra'yuh kabo maraynva. ra'yuh nadek <??>.");
  assert.equal(tr('').mode,'empty');
  assert.equal(tr('x'.repeat(2001)).roman,'<??>');
});

test('glyph and romanisation boundaries round-trip for every single-word dictionary key',()=>{
  for(const key of Object.keys(scope.dict))if(!key.includes(' '))assert.equal(api.encode(api.romanize(key)),key,key);
  for(const key of ['rayu','raj','seEngaf','haGgra','sha','gnAt'])assert.equal(api.encode(api.romanize(key)),key,key);
});

test('11 sourced additions, no duplicate existing headwords or unknown glyphs',()=>{
  assert.equal(Object.keys(scope.dict).length,450);
  const additions=Object.values(scope.dict).filter(e=>e.status==='community-lesson');
  assert.equal(additions.length,11);
  assert.ok(additions.every(e=>e.source&&e.en.length));
  assert.ok(scope.dict.yaf.def.includes('not abstract possession'));
  assert.equal(scope.dict.haGgra.gloss,'is-it-true-that');
});

test('unsupported signed and decimal numbers are not silently changed',()=>{
  for(const s of ['I sense 1.5 humans.','I sense -8 humans.','I sense 12345678901234567890123456789012345 humans.']) {
    const r=tr(s);assert.equal(r.mode,'partial',s);assert.ok(r.roman.includes('<??>'),s);
  }
});

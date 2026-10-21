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
  for(const en of ['I do not eat flowers.','If I speak you listen.','I am happy.','I have eaten food.'])assert.equal(tr(en).mode,'partial',en);
  assert.equal(tr('name').roman,'<??>'); // noun name and verb name need context
  assert.equal(tr('I speak Marain and eat food.').mode,'partial');
  assert.ok(tr('I do not eat flowers.').notes.some(n=>n.includes('No case endings')));
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
  assert.equal(Object.keys(scope.dict).length,460);
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

test('newly proposed modal lexemes are separate from recovered lesson vocabulary',()=>{
  const keys=['ke','fOnOft','giwEnOft','SuztnOft','kwemrakOha','wolOgnOft','haGCa'];
  for(const key of keys)assert.equal(scope.dict[key].status,'proposed-extension',key);
  for(const key of ['haG','gra','haGgra'])assert.equal(scope.dict[key].status,'community-lesson',key);
  assert.equal(Object.values(scope.dict).filter(e=>e.status==='proposed-extension').length,10);
  assert.ok(scope.dict.anoG.proposed_sense.includes('epistemic'));
});

test('simple modal clauses keep complement and negation scope distinct',()=>{
  const cases=[
    ['I can speak Marain.',"ra'yuh funuft kabo maraynva."],
    ["I can't speak Marain.","ra'yuh funuft hech kabo maraynva."],
    ['I may speak Marain.',"ra'yuh gihwinuft kabo maraynva."],
    ['I might speak Marain.',"anong ra'yuh kabo maraynva."],
    ['Perhaps I speak Marain.',"anong ra'yuh kabo maraynva."],
    ['I want to speak Marain.',"ra'yuh okehi kabo maraynva."],
    ['I want you to speak Marain.',"ra'yuh okehi geyuh kabo maraynva."],
    ['I need to speak Marain.',"ra'yuh ku'ha kabo maraynva."],
    ['I do not need to speak Marain.',"ra'yuh ku'ha hech kabo maraynva."],
    ['I should speak Marain.',"ra'yuh shuhztnuft kabo maraynva."],
    ['I should not speak Marain.',"ra'yuh shuhztnuft kabo hech maraynva."],
    ['I must speak Marain.',"ra'yuh kwemraku'ha kabo maraynva."],
    ['I must not speak Marain.',"ra'yuh kwemraku'ha kabo hech maraynva."],
    ['I intend to speak Marain.',"ra'yuh wolugnuft kabo maraynva."],
    ['Can you speak Marain?', 'hanggra geyuh funuft kabo maraynva?'],
    ['Do you want to speak Marain?', 'hanggra geyuh okehi kabo maraynva?']
  ];
  for(const [english,roman] of cases){
    const r=tr(english);
    assert.equal(r.roman,roman,english);
    assert.equal(r.mode,'draft',english);
    assert.ok(r.notes.some(n=>n.includes('proposed')),english);
  }
});

test('unsupported conditionals do not masquerade as translated clauses',()=>{
  const r=tr('If I could speak Marain, I would speak to you.');
  assert.equal(r.mode,'partial');
  assert.ok(r.missing.length);
});

test('irrealis ending deletion is romanization-specific and preserves glyph keys',()=>{
  const cases={
    uprahay:"upraha'tcha",
    funuft:"funuf'tcha",
    okehi:"okehi'tcha",
    nocht:"noch'tcha",
    hech:"he'tcha",
    heth:"heth'tcha",
    wach:"wa'tcha",
    pac:"pa'tcha",
    sap:"sa'tcha",
    bad:"ba'tcha",
    pat:"pa'tcha",
    pay:"pa'tcha",
    kabo:"kabo'tcha"
  };
  for(const [stem,expected] of Object.entries(cases))
    assert.equal(api.hypotheticalRoman(stem),expected,stem);
  for(const [stem,roman] of [['OprahA',"upraha'tcha"],['fOnOft',"funuf'tcha"],
      ['okehE',"okehi'tcha"],['heT',"heth'tcha"],['noHt',"noch'tcha"]]){
    const derived=api.hypothetical(stem);
    assert.equal(derived.roman,roman,stem);
    assert.equal(api.encode(roman),derived.glyphKey,stem);
    assert.equal(api.romanize(derived.key),roman,stem);
  }
  assert.equal(api.hypotheticalRoman(''),null);
});

test('v0.2 hypotheticals, leave and belief clauses use zero-marked chaining',()=>{
  const cases=[
    ['I leave.',"ra'yuh uprahay nayla."],
    ['I would leave.',"ra'yuh upraha'tcha nayla."],
    ['I want to leave.',"ra'yuh okehi uprahay nayla."],
    ['I would like to leave.',"ra'yuh okehi'tcha uprahay nayla."],
    ['I can leave.',"ra'yuh funuft uprahay nayla."],
    ['I could leave.',"ra'yuh funuf'tcha uprahay nayla."],
    ['I should leave.',"ra'yuh shuhztnuft uprahay nayla."],
    ['I think you should leave.',"ra'yuh heth geyuh shuhztnuft uprahay nayla."],
    ['I think that you should leave.',"ra'yuh heth geyuh shuhztnuft uprahay nayla."],
    ['I would think you should leave.',"ra'yuh heth'tcha geyuh shuhztnuft uprahay nayla."]
  ];
  for(const [english,roman] of cases){
    const r=tr(english);
    assert.equal(r.roman,roman,english);
    assert.equal(r.mode,'draft',english);
    assert.ok(r.notes.some(n=>/proposed|extension/.test(n)),english);
    assert.equal(r.glyphs.includes("'"),false,'apostrophe must not be a glyph for '+english);
  }
  assert.equal(tr('I would leave.').glyphs,'rayu OprahaCa nAla.');
  assert.equal(tr('I could leave.').glyphs,'rayu fOnOfCa OprahA nAla.');
  assert.equal(tr('I would like a flower.').mode,'partial');
});

test('v0.3 lexical additions are explicitly proposed and do not replace recovered entries',()=>{
  for(const key of ['gralemi','tSaEnsle','EnAG']){
    assert.equal(scope.dict[key].status,'proposed-extension',key);
    assert.ok(scope.dict[key].derivation);
    assert.ok(scope.dict[key].source.includes('v0.3'));
    assert.equal(api.encode(api.romanize(key)),key);
  }
  assert.equal(Object.keys(scope.dict).length,460);
  assert.equal(scope.dict.lemi.gloss,'sense[v]');
  assert.equal(scope.dict.wolOg.gloss,'plan[n]');
});

test('patientive case marks the undergoer; agent and tense stay separate',()=>{
  assert.equal(api.inflect('to','pat'),'tovu');
  assert.equal(api.romanize(api.inflect('to','pat')),'tovuh');
  assert.equal(api.inflect('pren','pat'),'prenvu');
  assert.equal(api.romanize(api.inflect('pren','pat')),'prenvuh');
  assert.equal(api.inflect('to','acc'),'tova');
  assert.equal(api.inflect('to','nom'),'toyu');
  for(const [en,expected] of [
    ['It was imagined.','tovuh tshainsle bechumli.'],
    ['It is imagined.','tovuh tshainsle.'],
    ['It will be imagined.','tovuh tshainsle beyanli.']
  ]){
    const r=tr(en);
    assert.equal(r.roman,expected,en);
    assert.equal(r.mode,'draft',en);
    assert.ok(r.notes.some(n=>n.includes('patientive')),en);
  }
  assert.equal(tr('It was forgotten.').mode,'partial');
});

test('resultative and prospective retain stems and use apostrophe as a non-glyph boundary',()=>{
  const examples=[
    ['OprahA','prospective',"uprahay'wolug",'OprahAwolOg'],
    ['tSaEnsle','resultative',"tshainsle'inayng",'tSaEnsleEnAG'],
    ['fOnOft','prospective',"funuft'wolug",'fOnOftwolOg'],
    ['kabo','resultative',"kabo'inayng",'kaboEnAG']
  ];
  for(const [stem,kind,expected,glyphs] of examples){
    const result=api.predicateSuffix(stem,kind);
    assert.equal(result.roman,expected,stem);
    assert.equal(result.glyphKey,glyphs,stem);
    assert.equal(api.romanize(result.key),expected,stem);
    assert.equal(api.encode(expected),glyphs,stem);
  }
  assert.equal(api.predicateSuffix('OprahA','unknown'),null);
  assert.equal(api.predicateSuffix(api.hypothetical('OprahA').key,'prospective'),null);
});

test('prospective intentions and independently future obligations remain distinct',()=>{
  const examples=[
    ['I plan to leave.',"ra'yuh uprahay'wolug nayla."],
    ['I am planning to leave.',"ra'yuh uprahay'wolug nayla."],
    ['I am scheduled to leave.',"ra'yuh uprahay'wolug nayla."],
    ['I must leave in the future.',"ra'yuh kwemraku'ha uprahay nayla beyanli."],
    ['I am scheduled and obliged to leave.',"ra'yuh kwemraku'ha uprahay'wolug nayla."]
  ];
  for(const [english,expected] of examples){
    const r=tr(english);
    assert.equal(r.roman,expected,english);
    assert.equal(r.mode,'draft',english);
    assert.ok(r.notes.some(n=>n.includes('extension v0.3')) || r.rules.some(n=>n.includes('future time')),english);
    assert.ok(!r.glyphs.includes("'"),english);
  }
  assert.equal(tr('I plan to leave.').glyphs,'rayu OprahAwolOg nAla.');
});

test('resultative explicitly marks second-clause consequence without assigning it to the past',()=>{
  const r=tr('I would like to know, therefore it was imagined.');
  assert.equal(r.roman,"ra'yuh okehi'tcha gralemih, tovuh tshainsle'inayng bechumli.");
  assert.equal(r.glyphs,'rayu okehECa gralemi, tovu tSaEnsleEnAG beHOmlE.');
  assert.equal(r.mode,'draft');
  assert.ok(r.notes.some(n=>n.includes('causal relation')));
  assert.ok(r.rules.some(n=>n.includes('resultative')));
  assert.equal(tr('It was imagined.').roman,'tovuh tshainsle bechumli.');
  assert.equal(tr('I would like to know, therefore it was teleporting.').mode,'partial');
});

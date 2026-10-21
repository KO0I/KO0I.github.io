/* Lesson-based, deliberately bounded English → Marain. No network or fuzzy matching. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.MarainPhrases = factory(root.dict, root.alpha);
}(typeof window !== 'undefined' ? window : globalThis, function (dict, alpha) {
  'use strict';
  const UNKNOWN = '<??>';
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const normal = s => String(s || '').normalize('NFKC').replace(/[’‘]/g, "'").toLowerCase().trim().replace(/\s+/g, ' ');
  const words = s => normal(s).match(/[-+]?\d+(?:[.,]\d+)*|[\p{L}]+(?:['-][\p{L}\p{N}]+)*/gu) || [];
  const units = Object.entries(alpha).map(([key, a]) => [a[1], key]).sort((a, b) => b[0].length - a[0].length);
  function encode(roman) {
    let out = '';
    for (let i = 0; i < roman.length;) {
      if (roman[i] === "'") { i++; continue; }
      const match = units.find(([r]) => roman.startsWith(r, i));
      if (!match) return null;
      out += match[1]; i += match[0].length;
    }
    return out;
  }
  // Only insert separators where concatenation would change the glyph sequence.
  function romanize(key) {
    // Irrealis suffix apostrophe is morphological, so it must survive romanization.
    // Suffix boundaries are stored in internal keys for romanisation only.
    for (const [suffix, spelling] of [['wolOga','woluga'],['wolOgE','wolugi'],['EnAGa','inaynga'],['EnAGE','inayngi'],['Ca','tcha'],['EnAG','inayng'],['wolOg','wolug']]) {
      const marker="'"+suffix;
      if (key.endsWith(marker) && key.length>marker.length)
        return romanize(key.slice(0,-marker.length))+"'"+spelling;
    }
    let out = '', prefix = '';
    for (const ch of key) {
      if (!own(alpha, ch)) { out += ch; prefix = ''; continue; }
      const r = alpha[ch][1];
      const last = out.split(/\s/).pop();
      if (prefix && encode(last + r) !== prefix + ch) out += "'";
      out += r; prefix += ch;
    }
    return out;
  }

  // Proposed v0.2 irrealis suffix. The apostrophe is romanised morphology,
  // not a Marain glyph. Delete one eligible ending before adding 'tcha.
  function hypotheticalRoman(roman) {
    if(typeof roman!=='string' || !roman || /\s/.test(roman))return null;
    const stem=roman.replace(/(?:ch|[cpdty])$/,'');
    return stem ? stem+"'tcha" : null;
  }
  function hypothetical(key) {
    const roman=hypotheticalRoman(romanize(key));
    if(!roman)return null;
    const glyphKey=encode(roman);
    if(!glyphKey || !glyphKey.endsWith('Ca'))return null;
    return {roman, glyphKey, key:glyphKey.slice(0,-2)+"'Ca"};
  }
  // Proposed v0.3 predicate markers RES and PROS preserve the entire stem.
  // Unlike 'tcha, they do not delete a preceding letter; no stacked suffixes
  // are interpreted until their ordering and scope are explicitly established.
  function predicateSuffix(key, kind) {
    const suffixes={resultative:['EnAG','inayng'],prospective:['wolOg','wolug']};
    if(!own(suffixes,kind) || !key || key.includes("'") || !romanize(key))return null;
    const [suffix,spell]=suffixes[kind], roman=romanize(key)+"'"+spell;
    const glyphKey=encode(roman);
    if(!glyphKey || !glyphKey.endsWith(suffix))return null;
    return {roman,glyphKey,key:key+"'"+suffix};
  }


  // Optional poetic register v0.4: meaning-preserving cadence variants
  // apply only to prospective and resultative predicates, not 'tcha.
  function poeticCadence(stemKey,kind,cadence) {
    if(!['prospective','resultative'].includes(kind)||!['a','i'].includes(cadence))return null;
    if(!own(dict,stemKey))return null;
    const entry=dict[stemKey];
    if(entry.pos!=='verb'&&entry.pos!=='modal'&&!/^to\s/.test(entry.def))return null;
    const base=predicateSuffix(stemKey,kind);
    if(!base)return null;
    const v=cadence==='a'?'a':'E', glyphKey=base.glyphKey+v, roman=base.roman+cadence;
    if(encode(roman)!==glyphKey)return null;
    return {kind,cadence,baseKey:stemKey,key:base.key+v,glyphKey,roman};
  }
  function reversePoeticCadence(formKey) {
    if(typeof formKey!=='string')return null;
    const suffixes=[["'wolOga",'prospective','a'],["'wolOgE",'prospective','i'],["'EnAGa",'resultative','a'],["'EnAGE",'resultative','i']];
    for(const [ending,kind,cadence] of suffixes){
      if(!formKey.endsWith(ending))continue;
      const baseKey=formKey.slice(0,-ending.length);
      const match=poeticCadence(baseKey,kind,cadence);
      if(match&&match.key===formKey)return {baseKey,kind,cadence,canonical:predicateSuffix(baseKey,kind).key};
    }
    return null;
  }
  // Gaelic-inspired, not Gaelic's actual lenition: opt-in after 'po' only.
  // Reversal requires the trigger and a unique, non-colliding dictionary base.
  const poeticTriggers=new Set(['po']);
  const onsetChanges={p:'f',b:'v',t:'T',s:'S',k:'H'};
  const onsetUndo={f:'p',v:'b',T:'t',S:'s',H:'k'};
  function poeticMutate(triggerKey,lemmaKey){
    if(!poeticTriggers.has(triggerKey)||typeof lemmaKey!=='string'||!own(dict,lemmaKey)||lemmaKey===triggerKey)return null;
    const entry=dict[lemmaKey];
    if(['verb','modal','particle','adverb','conjunction'].includes(entry.pos) || /^to\s/.test(entry.def.trim()))return null;
    const ch=onsetChanges[lemmaKey[0]];
    if(!ch)return null;
    const key=ch+lemmaKey.slice(1);
    if(own(dict,key)||encode(romanize(key))!==key)return null;
    return {triggerKey,baseKey:lemmaKey,key,roman:romanize(key)};
  }
  function reversePoeticMutation(triggerKey,formKey){
    if(!poeticTriggers.has(triggerKey)||typeof formKey!=='string'||own(dict,formKey))return null;
    const ch=onsetUndo[formKey[0]];
    if(!ch)return null;
    const baseKey=ch+formKey.slice(1);
    const generated=poeticMutate(triggerKey,baseKey);
    return generated&&generated.key===formKey?{triggerKey,baseKey,roman:romanize(baseKey)}:null;
  }
  function inflect(key, role) {
    if (key === UNKNOWN) return key;
    const suffixes = {acc:'va', dat:'vil', org:'sa', loc:'lE', com:'j', pat:'vu', abs:''};
    if (role === 'nom') return key + (/[AEOaeiouj]$/.test(key) ? 'yu' : 'u');
    return key + (suffixes[role] || '');
  }
  const pronouns = {i:'ra', me:'ra', we:'ora', us:'ora', you:'ge', 'you all':'LA',
    he:'to', him:'to', she:'to', her:'to', it:'to', they:'wu', them:'wu', people:'oGE'};
  const possessors = {my:'ra', our:'ora', your:'ge', his:'to', her:'to', its:'to', their:'wu'};
  const adjectives = new Set(['hyl','TA','po','eselE','hegAret','TEnLaz','berO','dafinj','spats',
    'samOn','haG','gra','saveneft','sab','brAn','Gedil','hapaO','gesta','fenEk','swo','sAk','vA','Cu']);
  const aliases = {
    ra:['i','me'], ora:['we','us'], ge:['you'], LA:['you all'], to:['he','him','she','her','it'],
    wu:['they','them'], oG:['one (impersonal)'], oGE:['people'], pren:['spaceship','ship'],
    marAn:['marain'], rAbin:['the culture'], rAmurer:['a mind'], OprAhe:['humanoid','human'],
    TA:['big','large'], eselE:['attractive','aesthetically pleasing'], heH:['no','not','without'],
    daG:['as','like'], nAla:['away','opposite direction'], lEg:['more'],
    ObE:['drug'], u:['and','plus'], sha:['bottom','down'], Sin:['top','up'],
    jhE:['as for','concerning','in regards to'], heHkwemrawE:['meatfucker']
  };
  const lex = new Map();
  function add(term, key, pos) {
    term = normal(term).replace(/-/g, ' ');
    if (!term || !/^[a-z][a-z ']*$/.test(term)) return;
    if (!lex.has(term)) lex.set(term, []);
    if (!lex.get(term).some(x => x.key === key && x.pos === pos)) lex.get(term).push({key, pos});
  }
  Object.entries(dict).forEach(([key, entry]) => {
    if (key.includes(' ')) return; // Multiword lexemes are registered by gloss below where applicable.
    const isVerb = entry.pos === 'verb' || /^to\s/.test(entry.def.trim());
    const pos = own(pronouns, key) ? 'pronoun' : adjectives.has(key) ? 'adjective' : isVerb ? 'verb' : 'noun';
    const supplied = entry.en ? [].concat(entry.en) : [];
    const gloss = entry.gloss.replace(/\[[^\]]*\]/g, '').replace(/-/g, ' ');
    const definition = entry.def.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
    const terms = aliases[key] || supplied.concat([gloss], definition.split(/[;,/]/));
    terms.forEach(term => {
      term = term.trim().replace(/^to\s+/, '');
      add(term, key, pos);
      // Full English inflections only; no substring/fuzzy matches.
      if (/^[a-z]+$/.test(term) && pos === 'noun' && !Object.values(pronouns).includes(key)) {
        const plural = /[^aeiou]y$/.test(term) ? term.slice(0,-1)+'ies' : /(?:s|x|z|ch|sh)$/.test(term) ? term+'es' : term+'s';
        add(plural, key, pos);
      }
    });
  });
  Object.entries(pronouns).forEach(([term,key]) => { lex.set(term,[{key,pos:'pronoun'}]); });
  // Do not turn the impersonal pronoun into the number one.
  ['zero','one','two','three','four','five','six','seven'].forEach((w,i) => lex.set(w,[{key:['nheH','sto','hre','dosa','Lami','ko','gol','ljwA'][i],pos:'number'}]));
  // These multiword meanings must win before their component words.
  [['eight','stonheH'],['nine','stosto'],['ten','stohre']].forEach(([w,key])=>lex.set(w,[{key,pos:'number'}]));
  add('special circumstances','rAgivilst','noun');
  add('look to windward','owataO luva','phrase');
  add('fall','des sha','verb');
  const verbs = {
    kabo:{forms:['speak','speaks','spoke','talk','talks','say','says','said'], object:'optional'},
    OprahA:{forms:['leave','leaves','left','go away','goes away','went away','go','goes','went','move','moves','moved'], object:'none'},
    gralemi:{forms:['know','knows','knew'],object:'optional'},
    tSaEnsle:{forms:['imagine','imagines','imagined'],object:'required'},
    gore:{forms:['meet','meets','met'], object:'required'},
    nadek:{forms:['consume','consumes','consumed','ingest','ingests','ingested','eat','eats','ate'], object:'required'},
    zawen:{forms:['ride','rides','rode','ride aboard','rides aboard'], object:'required'},
    yaf:{forms:['hold','holds','held'], object:'required'},
    bahLaveHt:{forms:['hoard','hoards','hoarded'], object:'required'},
    yafSpen:{forms:['give','gives','gave'], object:'required'},
    yafmurer:{forms:['accept','accepts','accepted'], object:'required'},
    Evem:{forms:['like','likes','liked'], object:'required'},
    HakLEH:{forms:['hate','hates','hated'], object:'required'},
    hakla:{forms:['learn','learns','learned','learnt'], object:'optional'},
    gafmara:{forms:['write','writes','wrote','type','types','typed'], object:'optional'},
    lemi:{forms:['sense','senses','sensed'], object:'required'},
    Ensle:{forms:['make','makes','made'], object:'required'},
    EltsE:{forms:['use','uses','used'], object:'required'},
    rezen:{forms:['grow','grows','grew'], object:'optional'},
    sAno:{forms:['exist','exists','existed'], object:'none'},
    tas:{forms:['sit','sits','sat'], object:'none'},
    noHt:{forms:['stop','stops','stopped'], object:'none'}
  };
  for (const [key,v] of Object.entries(verbs)) { v.forms.sort((a,b)=>b.length-a.length); for (const form of v.forms) add(form,key,'verb'); }
  function lookup(term, pos) {
    let entries = lex.get(normal(term)) || [];
    if (pos === 'nominal') entries = entries.filter(e => e.pos === 'noun' || e.pos === 'pronoun');
    else if (pos) entries = entries.filter(e => e.pos === pos);
    return [...new Map(entries.map(e => [e.key,e])).values()];
  }
  function resultContext() { return {missing:[], notes:[], alignment:[], rules:[]}; }
  function unknown(en, ctx, reason='No dictionary match') {
    ctx.missing.push(en); ctx.alignment.push({english:en,marain:UNKNOWN,reason}); return UNKNOWN;
  }
  function emit(key, en, ctx, role='abs', reason='Dictionary match') {
    const formed = inflect(key,role);
    ctx.alignment.push({english:en,marain:romanize(formed),reason:role === 'abs' ? reason : reason+'; '+role});
    return formed;
  }
  function numberKey(n) {
    if (!/^\d+$/.test(n) || n.length > 30) return null;
    const octal = BigInt(n).toString(8);
    return [...octal].map(d => ['nheH','sto','hre','dosa','Lami','ko','gol','ljwA'][+d]).join('');
  }
  function nounPhrase(text, role, ctx) {
    let en = normal(text), determiner = '';
    if (own(pronouns,en)) return [emit(pronouns[en],en,ctx,role)];
    if (en === 'the culture') return [emit('rAbin',en,ctx,role)];
    let ts = words(en);
    if (!ts.length) return null;
    let owner = null;
    if (own(possessors,ts[0])) { owner=possessors[ts.shift()]; }
    else if (/^(a|an|the)$/.test(ts[0])) { determiner=ts.shift(); }
    let count = null;
    if (/^\d+$/.test(ts[0]||'')) { count=numberKey(ts.shift()); if(!count)return null; }
    else {
      const numeric=lookup(ts[0]||'','number');
      if(numeric.length===1){ count=numeric[0].key;ts.shift(); }
    }
    const full=lookup(ts.join(' '),'nominal');
    let body;
    if(full.length===1) body=[emit(full[0].key,ts.join(' '),ctx,role)];
    else if(full.length>1) return null;
    else {
      // Only the lesson-supported, attributive adjective + head pattern; mark inference.
      const mods=[];
      while(ts.length>1) {
        const m=lookup(ts[0],'adjective');
        if(m.length!==1) break;
        mods.push({...m[0],english:ts.shift()});
      }
      const head=lookup(ts.join(' '),'nominal');
      if(head.length===1) body=mods.map(x=>emit(x.key,x.english,ctx)).concat(emit(head[0].key,ts.join(' '),ctx,role));
      else if(ts.length===1 && !lookup(ts[0]).length) body=mods.map(x=>emit(x.key,x.english,ctx)).concat(unknown(ts[0],ctx));
      else return null;
      if(mods.length) ctx.notes.push('Attributive adjective order is provisional; the lessons do not fully specify adjective agreement.');
    }
    if(owner) { body.push(/^m/.test(owner)?'da':'dam',emit(owner,'possessor',ctx));ctx.rules.push('Possessor: noun + dam + possessor (Lesson 20).'); }
    if(count) { body.unshift(count,'dam');ctx.rules.push('Quantity: number + dam + case-marked noun (numbers sheet).'); }
    if(determiner) ctx.notes.push('English articles are omitted, following the lesson examples; definiteness is not otherwise encoded.');
    return body;
  }
  function lexical(text,ctx) {
    const ts=words(text), output=[];
    for(let i=0;i<ts.length;) {
      let found=null, n=0;
      for(let len=Math.min(6,ts.length-i);len>0;len--) {
        const en=ts.slice(i,i+len).join(' '), candidates=lookup(en);
        if(candidates.length) { found={en,candidates};n=len;break; }
      }
      if(found) {
        if(found.candidates.length===1) output.push(emit(found.candidates[0].key,found.en,ctx));
        else output.push(unknown(found.en,ctx,'Ambiguous: '+found.candidates.map(e=>romanize(e.key)).join(' / ')));
        i+=n;
      } else if(/^\d+$/.test(ts[i]) && numberKey(ts[i])) {
        output.push(emit(numberKey(ts[i]),ts[i],ctx,'abs','Decimal integer converted to base eight'));i++;
      } else { output.push(unknown(ts[i],ctx));i++; }
    }
    ctx.notes.push('Word/phrase matches only: this sentence structure is not covered. No case endings were guessed.');
    return output;
  }
  const fixed = {
    'hello': ['hylge','Lesson 7'],
    'how are you doing': ['yokASA sAno geyu','Lesson 7'],
    'i am doing well': ['rayu perat hyl','Lesson 7'],
    'what is your name': ['SA seEngafva datSa gevil','Lesson 7'],
    'i do not do drugs': ['rayu nadek heH ObEva','IMG_2187 usage example'],
    'i am from the culture': ['rayu sAno rAbinsa','Case pattern inferred from Lesson 1'],
    'the mind speaks marain to me like a friend': ['rAmureru kabo marAnva ravil yokA EvemE','Lesson 12'],
    'my mind state is backed up in the spaceship': ['murermarayu dam ra sAno prenlE','Lesson 12']
  };

  // Community grammar extension v0.2: zero-marked predicate chaining and scope.
  // These are proposed constructions, not claims about recovered Banks canon.
  const modalForms = [
    ['do not need to','kOha','matrix'], ['does not need to','kOha','matrix'],
    ['do not want to','okehE','matrix'], ['does not want to','okehE','matrix'],
    ['am not permitted to','giwEnOft','matrix'], ['is not permitted to','giwEnOft','matrix'],
    ['are not permitted to','giwEnOft','matrix'],
    ['am not obliged to','kwemrakOha','matrix'], ['is not obliged to','kwemrakOha','matrix'],
    ['are not obliged to','kwemrakOha','matrix'],
    ['must not','kwemrakOha','embedded'], ['should not','SuztnOft','embedded'],
    ['cannot','fOnOft','matrix'], ["can't",'fOnOft','matrix'], ['can not','fOnOft','matrix'],
    ['would like to','okehE','hypothetical'], ['would want to','okehE','hypothetical'],
    ['would need to','kOha','hypothetical'], ['would have to','kwemrakOha','hypothetical'],
    ['could','fOnOft','hypothetical'],
    ['should','SuztnOft','none'], ['must','kwemrakOha','none'],
    ['have permission to','giwEnOft','none'], ['has permission to','giwEnOft','none'],
    ['may','giwEnOft','none'], ['can','fOnOft','none'],
    ['might','anoG','epistemic'], ['maybe','anoG','epistemic'],
    ['intend to','wolOgnOft','none'], ['intends to','wolOgnOft','none'],
    ['plan to','wolOgnOft','prospective'], ['plans to','wolOgnOft','prospective'], ['am planning to','wolOgnOft','prospective'], ['is planning to','wolOgnOft','prospective'], ['are planning to','wolOgnOft','prospective'],
    ['want to','okehE','none'], ['wants to','okehE','none'],
    ['need to','kOha','none'], ['needs to','kOha','none'],
    ['would like','okehE','explicit-hypothetical'], ['want','okehE','explicit'], ['wants','okehE','explicit']
  ];
  function extendedClause(text, question, ctx) {
    const possible=text.match(/^(maybe|perhaps) (.+)$/);
    if(possible) {
      const child=resultContext(), statement=parse(possible[2],child);
      if(!statement || statement.mode!=='draft')return null;
      for(const k of ['missing','notes','alignment','rules'])ctx[k].push(...child[k]);
      ctx.rules.push('Proposed whole-clause possibility particle: anong (grammar extension v0.1).');
      ctx.notes.push('Community grammar extension v0.1: newly proposed use of anong.');
      return {keys:[...(question?['haGgra']:[]),'anoG',...statement.keys],mode:'draft'};
    }
    const m=text.match(/^(you all|i|we|you|he|she|it|they) (.+)$/);
    if(!m)return null;
    const subject=m[1], remainder=m[2], matrixNom=inflect(pronouns[subject],'nom');
    for(const [form,modalKey,scope] of modalForms) {
      if(!remainder.startsWith(form+' '))continue;
      let expression=remainder.slice(form.length+1), embeddedActor=null;
      if(scope==='explicit'||scope==='explicit-hypothetical') {
        const actor=expression.match(/^(you all|i|we|you|he|she|it|they) to (.+)$/);
        if(!actor)continue;
        embeddedActor=actor[1];expression=actor[2];
      }
      const target=embeddedActor||subject;
      const child=resultContext(), statement=parse(target+' '+expression,child);
      if(!statement || statement.mode!=='draft' || statement.keys[0]!==inflect(pronouns[target],'nom'))continue;
      const event=statement.keys.slice(1);
      if(!event.length)continue;
      if(scope==='embedded')event.splice(1,0,'heH');
      let keys;
      const isProspective=scope==='prospective';
      const markedModal=(scope==='hypothetical'||scope==='explicit-hypothetical')?hypothetical(modalKey)?.key:modalKey;
      if(!isProspective && !markedModal)return null;
      if(isProspective) {
        const eventMark=predicateSuffix(event[0],'prospective');
        if(!eventMark)return null;
        event[0]=eventMark.key;
        keys=[matrixNom,...event];
      } else if(scope==='epistemic')keys=['anoG',matrixNom,...event];
      else keys=[matrixNom,markedModal,...(scope==='matrix'?['heH']:[]),...(embeddedActor?[inflect(pronouns[embeddedActor],'nom')]:[]),...event];
      if(question)keys.unshift('haGgra');
      ctx.alignment.push({english:subject,marain:romanize(matrixNom),reason:'Nominative subject'});
      ctx.alignment.push({english:form,marain:romanize(isProspective?event[0]:markedModal),reason:'Proposed predicate grammar; '+scope});
      for(const field of ['missing','notes','rules'])ctx[field].push(...child[field]);
      ctx.alignment.push(...child.alignment.slice(embeddedActor?0:1));
      ctx.rules.push(isProspective
        ? "Proposed prospective 'wolug: planned event; suffix attaches to the event rather than making an obligation."
        : 'Proposed zero-marked predicate chain: modal + following predicate; optional ke boundary for ambiguity. A new nominative marks an explicit subordinate actor.');
      if(scope==='matrix'||scope==='embedded')ctx.rules.push('Negation scope depends on hech placement; proposed extension, not recovered canon.');
      if(form==='may')ctx.notes.push('English “may” is interpreted as permission, not probability. Use “might” for epistemic possibility.');
      ctx.notes.push(isProspective
        ? 'Community grammar extension v0.3: prospective predicate marker; new proposal, not recovered grammar.'
        : 'Community grammar extension v0.2: newly proposed construction.');
      if(scope==='hypothetical'||scope==='explicit-hypothetical')ctx.notes.push('The irrealis suffix ' + "'tcha" + ' softens desire in English “would like”; other uses are hypothetical, not automatically polite.');
      return {keys,mode:'draft'};
    }
    return null;
  }

  // Belief about a proposition uses heth, not tsha ('think about').
  // An explicit second nominative introduces the embedded proposition.
  function beliefClause(text,question,ctx,depth) {
    const m=text.match(/^(you all|i|we|you|he|she|it|they) (would think|would believe|think|thinks|believe|believes) (?:that )?(you all|i|we|you|he|she|it|they) (.+)$/);
    if(!m || depth>2)return null;
    const child=resultContext(), clause=parse(m[3]+' '+m[4],child,depth+1);
    if(!clause || clause.mode!=='draft' || clause.keys[0]!==inflect(pronouns[m[3]],'nom'))return null;
    const matrix=m[2].startsWith('would ')?hypothetical('heT')?.key:'heT';
    if(!matrix)return null;
    const subject=inflect(pronouns[m[1]],'nom');
    ctx.alignment.push({english:m[1],marain:romanize(subject),reason:'Main nominative subject'});
    ctx.alignment.push({english:m[2],marain:romanize(matrix),reason:'Belief predicate; hypothetical if marked'});
    for(const field of ['missing','notes','alignment','rules'])ctx[field].push(...child[field]);
    ctx.rules.push('Proposed belief clause: heth + a separate nominative subject and proposition; tsha means to think about.');
    ctx.notes.push('Community grammar extension v0.2: new nested-predicate rule, not attested in the recovered lessons.');
    return {keys:[...(question?['haGgra']:[]),subject,matrix,...clause.keys],mode:'draft'};
  }
  function simpleWould(text,question,ctx,depth) {
    const m=text.match(/^(you all|i|we|you|he|she|it|they) would (.+)$/);
    if(!m || depth>2 || /^(like|want|think|believe|have)\b/.test(m[2]))return null;
    const child=resultContext(), base=parse(m[1]+' '+m[2],child,depth+1);
    if(!base || base.mode!=='draft' || base.keys[0]!==inflect(pronouns[m[1]],'nom'))return null;
    const form=hypothetical(base.keys[1]);
    if(!form)return null;
    for(const field of ['missing','notes','alignment','rules'])ctx[field].push(...child[field]);
    ctx.rules.push("Proposed irrealis predicate suffix 'tcha: drop final ch/c/p/d/t/y before attachment.");
    ctx.notes.push('Community grammar extension v0.2: hypothetical, not a recovered verb tense.');
    return {keys:[...(question?['haGgra']:[]),base.keys[0],form.key,...base.keys.slice(2)],mode:'draft'};
  }

  function passivePatientive(text,question,ctx) {
    // Passive-like English paraphrase: the patient is the subject, not an accusative object.
    // Only the attested-in-this-extension predicate 'imagine' is recognized here.
    const m=text.match(/^(.+?) (was|is|will be) imagined$/);
    if(!m)return null;
    const patient=nounPhrase(m[1],'pat',ctx);
    if(!patient)return null;
    const time=m[2]==='was'?['beHOmlE']:m[2]==='will be'?['beyanlE']:[];
    ctx.rules.push('Proposed eighth nominal case: patientive -vuh; actor unspecified; verb is unchanged.');
    ctx.notes.push('Community grammar extension v0.3: passive-like paraphrase using patientive; not recovered passive morphology.');
    if(m[2]==='was'||m[2]==='will be')ctx.rules.push('Temporal locative provides time, not tense inflection on the verb.');
    return {keys:[...(question?['haGgra']:[]),...patient,'tSaEnsle',...time],mode:'draft'};
  }
  function plannedObligation(text,question,ctx,depth) {
    const m=text.match(/^(you all|i|we|you|he|she|it|they) (?:am|is|are) (scheduled to|scheduled and obliged to|obliged and scheduled to) (.+)$/);
    if(!m || depth>2)return null;
    const child=resultContext(), simple=parse(m[1]+' '+m[3],child,depth+1);
    if(!simple || simple.mode!=='draft' || simple.keys[0]!==inflect(pronouns[m[1]],'nom'))return null;
    const plan=predicateSuffix(simple.keys[1],'prospective');
    if(!plan)return null;
    for(const field of ['missing','notes','alignment','rules'])ctx[field].push(...child[field]);
    const required=m[2]!=='scheduled to';
    ctx.rules.push("Proposed: prospective 'wolug marks a plan; independent kwemraku'ha expresses obligation.");
    ctx.notes.push('Community grammar extension v0.3: proposed planning/obligation construction, not recovered canon.');
    return {keys:[...(question?['haGgra']:[]),simple.keys[0],...(required?['kwemrakOha']:[]),plan.key,...simple.keys.slice(2)],mode:'draft'};
  }
  function prospectiveTime(text,question,ctx,depth) {
    const m=text.match(/^(.+) in the future$/);
    if(!m || depth>2)return null;
    const child=resultContext(), p=parse(m[1],child,depth+1);
    if(!p||p.mode!=='draft')return null;
    for(const field of ['missing','notes','alignment','rules'])ctx[field].push(...child[field]);
    ctx.rules.push('Beyanli supplies future time; it does not by itself mean scheduled or obligatory.');
    return {keys:[...(question?['haGgra']:[]),...p.keys,'beyanlE'],mode:'draft'};
  }
  function consequentClauses(text,ctx,depth) {
    const m=text.match(/^(.+?),\s*(therefore|thus|consequently)\s+(.+)$/);
    if(!m || depth>1)return null;
    const leftCtx=resultContext(),rightCtx=resultContext();
    const before=parse(m[1],leftCtx,depth+1),after=parse(m[3],rightCtx,depth+1);
    if(!before||!after||before.mode!=='draft'||after.mode!=='draft')return null;
    // Conservative: mark the second clause's main predicate, not any arbitrary modifier.
    const verbSet=new Set(Object.keys(verbs));
    const idx=after.keys.findIndex((key,i)=>i>0 && verbSet.has(key));
    if(idx<0)return null;
    const marked=predicateSuffix(after.keys[idx],'resultative');
    if(!marked)return null; // Stacking rules remain unresolved.
    const consequence=after.keys.slice();consequence[idx]=marked.key;
    for(const part of [leftCtx,rightCtx])for(const field of ['missing','notes','alignment','rules'])ctx[field].push(...part[field]);
    ctx.alignment.push({english:m[2],marain:"'inayng",reason:'Proposed predicate-level consequence, not merely temporal succession'});
    ctx.rules.push("Proposed resultative 'inayng attaches to the consequent clause's predicate; the preceding clause supplies the antecedent.");
    ctx.notes.push('Community grammar extension v0.3: causal relation asserted by speaker; not recovered canon.');
    return {keys:[...before.keys,',',...consequence],mode:'draft'};
  }
  function parse(input,ctx,depth=0) {
    if(depth>3)return null;
    let text=normal(input).replace(/\bi'm\b/g,'i am').replace(/\bdon't\b/g,'do not').replace(/\bdoesn't\b/g,'does not').replace(/\bdidn't\b/g,'did not');
    // Preserve the comma boundary for bounded causal constructions before lexical tokenization.
    const consequence=consequentClauses(text,ctx,depth);
    if(consequence)return consequence;
    const plain=words(text).join(' ').replace(/mind-state/g,'mind state');
    if(own(fixed,plain)) {
      ctx.rules.push('Attested expression: '+fixed[plain][1]);
      if(plain==='i am from the culture')ctx.rules[ctx.rules.length-1]=fixed[plain][1];
      ctx.alignment.push({english:input,marain:romanize(fixed[plain][0]),reason:fixed[plain][1]});
      return {keys:fixed[plain][0].split(' '),mode:plain==='i am from the culture'?'draft':'attested'};
    }
    text=plain;
    let question=false;
    if(text.startsWith('is it true that ')){text=text.slice(16);question=true;}
    else if(/^(do|does) /.test(text)){text=text.replace(/^(do|does) /,'');question=true;}
    // English modal auxiliary inversion, e.g. "Can you speak Marain?"
    const inverted=text.match(/^(can|may|must|should|might) (you all|i|we|you|he|she|it|they) (.+)$/);
    if(inverted){text=inverted[2]+' '+inverted[1]+' '+inverted[3];question=true;}
    const passive=passivePatientive(text,question,ctx);
    if(passive)return passive;
    const future=prospectiveTime(text,question,ctx,depth);
    if(future)return future;
    const scheduled=plannedObligation(text,question,ctx,depth);
    if(scheduled)return scheduled;
    const belief=beliefClause(text,question,ctx,depth);
    if(belief)return belief;
    const proposed=extendedClause(text,question,ctx);
    if(proposed)return proposed;
    const irrealis=simpleWould(text,question,ctx,depth);
    if(irrealis)return irrealis;
    // Existential possession deliberately differs from physical holding.
    let m=text.match(/^(i|we|you|he|she|it|they) (have|has) (.+)$/);
    if(m) {
      const object=nounPhrase(m[3],'nom',ctx); if(!object)return null;
      const keys=['jsAn',...object,emit(pronouns[m[1]],m[1],ctx,'com','Holder in existential possession')];
      if(question)keys.unshift('haGgra');
      ctx.rules.push('Possession: yesayn + thing.NOM + holder.COM (Lesson 21).');
      return {keys,mode:'draft'};
    }
    m=text.match(/^there (?:is|are) (.+)$/);
    if(m) { const np=nounPhrase(m[1],'nom',ctx);if(!np)return null;return {keys:[...(question?['haGgra']:[]),'jsAn',...np],mode:'draft'}; }
    // A copula is only paraphrased as existence for an explicit location/origin.
    m=text.match(/^(.+?) (?:am|is|are) (in|at|from|with) (.+)$/);
    if(m) {
      const subj=nounPhrase(m[1],'nom',ctx), obj=nounPhrase(m[3],{in:'loc',at:'loc',from:'org',with:'com'}[m[2]],ctx);
      if(!subj||!obj)return null;
      ctx.rules.push('Existence plus location/origin/companion: case suffixes from Lesson 1; sentence assembly is inferred.');
      return {keys:[...(question?['haGgra']:[]),...subj,'sAno',...obj],mode:'draft'};
    }
    // Complex embedded clauses, coordination, and non-modal negation remain unsupported.
    if(/\b(and|or|not|never|can|could|would|should|will|because|if)\b/.test(text))return null;
    const ts=words(text); let match=null;
    outer:for(let i=1;i<ts.length;i++) {
      for(const [key,v] of Object.entries(verbs)) for(const form of v.forms) {
        const f=form.split(' ');
        if(ts.slice(i,i+f.length).join(' ')===form) {
          match={key,v,index:i,len:f.length,form}; break outer;
        }
      }
    }
    if(!match)return null;
    const subject=nounPhrase(ts.slice(0,match.index).join(' '),'nom',ctx);if(!subject)return null;
    const remaining=ts.slice(match.index+match.len);
    let split=remaining.findIndex(t=>['to','in','at','from','with'].includes(t));
    if(split<0)split=remaining.length;
    const objText=remaining.slice(0,split).join(' '), tail=remaining.slice(split);
    if(match.v.object==='required'&&!objText)return null;
    if(match.v.object==='none'&&objText)return null;
    const obj=objText?nounPhrase(objText,'acc',ctx):[];if(!obj)return null;
    const departure=match.key==='OprahA' && /^(?:leave|leaves|left|go away|goes away|went away)$/.test(match.form);
    let pp=[];
    if(tail.length) {
      const prep=tail.shift();
      if(tail.some(x=>['to','in','at','from','with'].includes(x)))return null;
      const role={to:'dat',in:'loc',at:'loc',from:'org',with:'com'}[prep];
      pp=nounPhrase(tail.join(' '),role,ctx);if(!pp)return null;
      ctx.rules.push('Explicit '+prep+' phrase → '+role+' case (Lesson 1).');
    }
    ctx.rules.push('Subject.NOM + bare verb + object.ACC; predictable display order, not mandatory Marain word order.');
    if(question)ctx.rules.push('Yes/no question: hanggra (Lesson 16).');
    if(departure)ctx.notes.push('Community grammar extension v0.2: leave/go away is composed from go/move and away; not an attested compound.');
    if(/^(spoke|said|met|ate|rode|held|gave|wrote|made|grew|sat)$/.test(match.form)||/ed$/.test(match.form))ctx.notes.push('English past tense is not encoded in the verb. The lessons do not establish obligatory tense or aspect marking.');
    return {keys:[...(question?['haGgra']:[]),...subject,emit(match.key,match.form,ctx),...(departure?['nAla']:[]),...obj,...pp],mode:'draft'};
  }
  function translate(input) {
    input=String(input||'').trim();
    if(input.length>2000) return {roman:UNKNOWN,glyphs:UNKNOWN,segments:[{text:UNKNOWN,unknown:true}],missing:['Input over 2,000 characters'],notes:['Please shorten the input.'],alignment:[],rules:[],mode:'partial'};
    if(!input)return {roman:'',glyphs:'',segments:[],missing:[],notes:[],alignment:[],rules:[],mode:'empty'};
    const all=resultContext(),segments=[],modes=[];
    // Preserve sentence boundaries; unsupported punctuation is surfaced, never interpreted as markup.
    const sentences=[]; let chunk='';
    for(let i=0;i<input.length;i++) {
      const ch=input[i];chunk+=ch;
      const decimal=ch==='.' && /\d/.test(input[i-1]||'') && /\d/.test(input[i+1]||'');
      if(/[.!?]/.test(ch) && !decimal && !/[.!?]/.test(input[i+1]||'')){sentences.push(chunk);chunk='';}
    }
    if(chunk)sentences.push(chunk);
    for(const sentence of sentences) {
      const end=(sentence.match(/[.!?]+$/)||[''])[0];
      const body=sentence.slice(0,sentence.length-end.length).trim();
      if(!body)continue;
      let ctx=resultContext();
      let parsed=/[<>\[\]{}=;:"/\\]/.test(body)?null:parse(body,ctx);
      if(!parsed){ctx=resultContext();parsed={keys:lexical(body,ctx),mode:'partial'};}
      for(const field of ['missing','notes','alignment','rules'])all[field].push(...ctx[field]);
      modes.push(parsed.mode);
      if(segments.length)segments.push({text:' ',plain:true});
      parsed.keys.forEach((key,i)=>{
        // No whitespace before the inter-clause comma; preserve one after it.
        if(i && key!==',')segments.push({text:' ',plain:true});
        if(key===','){segments.push({text:',',plain:true});return;}
        const suffix=key.includes("'") && !key.startsWith("'");
        segments.push({text:suffix?key.replace(/'/g,''):key,roman:suffix?romanize(key):null,unknown:key===UNKNOWN});
      });
      if(end)segments.push({text:end,plain:true});
    }
    all.notes=[...new Set(all.notes)];all.rules=[...new Set(all.rules)];all.missing=[...new Set(all.missing)];
    all.roman=segments.map(s=>s.unknown||s.plain?s.text:(s.roman||romanize(s.text))).join('');
    all.glyphs=segments.map(s=>s.text).join('');all.segments=segments;
    all.mode=all.missing.length||modes.includes('partial')?'partial':modes.every(m=>m==='attested')?'attested':'draft';
    return all;
  }
  return {translate,romanize,encode,inflect,lookup,numberKey,hypotheticalRoman,hypothetical,predicateSuffix,poeticCadence,reversePoeticCadence,poeticMutate,reversePoeticMutation};
}));

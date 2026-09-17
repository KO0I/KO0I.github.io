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
  function inflect(key, role) {
    if (key === UNKNOWN) return key;
    const suffixes = {acc:'va', dat:'vil', org:'sa', loc:'lE', com:'j', abs:''};
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
  function parse(input,ctx) {
    let text=normal(input).replace(/\bi'm\b/g,'i am').replace(/\bdon't\b/g,'do not').replace(/\bdoesn't\b/g,'does not').replace(/\bdidn't\b/g,'did not');
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
    // Embedded clauses, coordination, modals, and negation need scope rules not supplied by these lessons.
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
    if(/^(spoke|said|met|ate|rode|held|gave|wrote|made|grew|sat)$/.test(match.form)||/ed$/.test(match.form))ctx.notes.push('English past tense is not encoded in the verb. The lessons do not establish obligatory tense or aspect marking.');
    return {keys:[...(question?['haGgra']:[]),...subject,emit(match.key,match.form,ctx),...obj,...pp],mode:'draft'};
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
        if(i)segments.push({text:' ',plain:true});
        segments.push({text:key,unknown:key===UNKNOWN});
      });
      if(end)segments.push({text:end,plain:true});
    }
    all.notes=[...new Set(all.notes)];all.rules=[...new Set(all.rules)];all.missing=[...new Set(all.missing)];
    all.roman=segments.map(s=>s.unknown||s.plain?s.text:romanize(s.text)).join('');
    all.glyphs=segments.map(s=>s.text).join('');all.segments=segments;
    all.mode=all.missing.length||modes.includes('partial')?'partial':modes.every(m=>m==='attested')?'attested':'draft';
    return all;
  }
  return {translate,romanize,encode,inflect,lookup,numberKey};
}));

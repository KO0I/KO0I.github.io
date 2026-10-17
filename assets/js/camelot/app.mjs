import {
  validateEdo,validateReference,mod,cents,frequency,fifthGenerator,generatorCycles,wheelOrder,
  normalizeSteps,transposeSteps,scalePresets,comparePitchSets,camelotName,camelotRelated,formatNumber
} from './tuning.mjs';

const $ = id => document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const colors=['#b44869','#a45777','#936489','#81709b','#687da5','#508da3','#469b94','#52a083','#77a466','#a4a05a','#b69152','#b6754d'];
const initial = () => ({version:1,edo:12,customN:53,layout:'chromatic',generator:7,reference:440,mode:'mixing',root:0,pitch:0,camelot:'8A',scale:[0,2,3,5,7,8,10],chord:[0,3,7],interval:7,wave:'sine',volume:.08,duration:.45});
let state=initial();
let audioContext=null, voices=[],audioEnabled=false, pendingTimers=[];
const num=v=>Number(v);
const svgElement=(tag,props,parent)=>{const element=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(props))element.setAttribute(k,String(v));parent.append(element);return element;};
const polar=(r,a,cx=280,cy=280)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
const sector=(r1,r2,a,b)=>{const p1=polar(r2,a),p2=polar(r2,b),p3=polar(r1,b),p4=polar(r1,a);return 'M'+p1+' A'+r2+','+r2+' 0 0 1 '+p2+' L'+p3+' A'+r1+','+r1+' 0 0 0 '+p4+' Z';};
const displayCode=step=>String(step);
const absoluteScale=()=>transposeSteps(state.scale,state.root,state.edo);
const absoluteChord=()=>transposeSteps(state.chord,state.root,state.edo);
const status=message=>{$('cw-status').textContent=message;};
function setCamelot(code){state.camelot=code;state.pitch=mod(Number(code.slice(0,-1))-8,12);render();}
function setPitch(p){state.pitch=mod(p,state.edo);render();if(audioEnabled)playNotes([state.pitch],.25);}
function chooseStep(p){
  p=mod(p,state.edo);
  if($('cw-edit').checked && state.edo!==12){
    const relative=mod(p-state.root,state.edo);
    state.scale=state.scale.includes(relative)?state.scale.filter(x=>x!==relative):normalizeSteps([...state.scale,relative],state.edo);
    $('cw-preset').value='custom';$('cw-scale').value=state.scale.join(',');
  }else state.pitch=p;
  render();
  if(audioEnabled)playNotes([p],.25);
}
function selectedRelations(){
  const relatives=new Set(absoluteScale());
  relatives.add(state.pitch);
  return relatives;
}
function renderWheel(){
  const svg=$('cw-wheel');svg.replaceChildren();
  const camelot=state.edo===12 && state.mode==='mixing';
  $('cw-wheel-heading').textContent=camelot?'Camelot Wheel':state.edo+'-EDO Wheel';
  const fullOrder=camelot?Array.from({length:12},(_,i)=>i):wheelOrder(state.edo,state.layout,state.generator);
  const count=fullOrder.length;
  const cycles=camelot?1:state.layout==='generator'?generatorCycles(state.edo,state.generator).length:1;
  $('cw-cycle-count').textContent=camelot?'12 keys · A/B':count+' steps · '+cycles+' cycle'+(cycles!==1?'s':'');
  const maxVisible=Math.min(count,240);
  const zoom=$('cw-zoom');
  zoom.max=String(maxVisible);zoom.min=String(Math.min(count,12));zoom.disabled=count<=12;
  if(!zoom.value || Number(zoom.value)>maxVisible || Number(zoom.value)<Number(zoom.min))zoom.value=String(maxVisible);
  const displayed=Math.min(count,Number(zoom.value));
  const order=displayed===count?fullOrder:fullOrder.filter((_,i)=>Math.floor(i*displayed/count)!==Math.floor((i-1)*displayed/count));
  const related=selectedRelations();
  const makeSegment=(step,ring,i,n,label)=>{
    const center=-Math.PI/2+(i+.5)*2*Math.PI/n;
    const a=-Math.PI/2+i*2*Math.PI/n,b=-Math.PI/2+(i+1)*2*Math.PI/n;
    const [inner,outer]=ring==='A'?[105,177]:[178,254];
    const color=colors[Math.floor(i*12/n)%12];
    const path=svgElement('path',{d:sector(inner,outer,a,b),fill:color,role:'button',tabindex:0,class:'cw-segment', 'aria-label':label,'aria-pressed':String(camelot?state.camelot===label:state.pitch===step)},svg);
    if(camelot){
      const allowed=new Set(camelotRelated(state.camelot).map(o=>o.code));
      path.classList.toggle('is-selected',label===state.camelot);
      path.classList.toggle('is-compatible',label!==state.camelot&&allowed.has(label));
      path.classList.toggle('is-faded',!allowed.has(label));
    }else{
      path.classList.toggle('is-selected',state.pitch===step);
      path.classList.toggle('is-compatible',state.pitch!==step&&related.has(step));
      path.classList.toggle('is-faded',!related.has(step));
    }
    const select=()=>camelot?setCamelot(label):chooseStep(step);
    path.addEventListener('click',select);
    path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const all=[...svg.querySelectorAll('.cw-segment')];const idx=all.indexOf(path);all[mod(idx+(e.key==='ArrowRight'?1:-1),all.length)].focus();}});
    if(n<=48 || i%Math.ceil(n/48)===0){
      const [x,y]=polar((inner+outer)/2,center);
      const node=svgElement('text',{x,y,class:'cw-label','font-size':n>36?'10':'13'},svg);
      node.textContent=label;
    }
  };
  if(camelot){
    for(let i=0;i<12;i++){const number=mod(i+7,12)+1;makeSegment(i,'B',i,12,number+'B');makeSegment(i,'A',i,12,number+'A');}
  }else{
    order.forEach((step,i)=>makeSegment(step,'B',i,order.length,displayCode(step)));
    // Scale membership in inner ring. Intentionally independent of compatibility calculations.
    const selected=new Set(absoluteScale());
    const safeOrder=state.layout==='generator'?wheelOrder(state.edo,state.layout,state.generator):fullOrder;
    safeOrder.forEach((step,i)=>{
      if(count>240)return;
      if(!selected.has(step))return;
      const a=-Math.PI/2+i*2*Math.PI/count,b=a+2*Math.PI/count;
      const mark=svgElement('path',{d:sector(107,173,a,b),fill:'#b8a1cb',stroke:'#100e19','stroke-width':1,opacity:.8},svg);
      mark.setAttribute('pointer-events','none');
    });
  }
  svgElement('circle',{cx:280,cy:280,r:101,fill:'#15121d',stroke:'#574b62','stroke-width':2},svg);
  const text=svgElement('text',{x:280,y:275,class:'cw-center'},svg);text.textContent=camelot?'CAMELOT':state.edo+' EDO';
  const sub=svgElement('text',{x:280,y:304,class:'cw-center','font-size':'12'},svg);sub.textContent=camelot?'HARMONIC MIXING':'PITCH CLASSES';
  $('cw-selected').textContent=camelot?state.camelot+' · '+camelotName(state.camelot):'Step '+state.pitch+' / '+state.edo;
}
function renderGraph(){
  const graph=$('cw-graph');graph.replaceChildren();
  const notes=state.edo===12&&state.mode==='mixing'?Array.from({length:12},(_,i)=>i):absoluteScale();
  const allCount=notes.length;
  const visibleNotes=allCount>36?notes.filter((_,i)=>Math.floor(i*36/allCount)!==Math.floor((i-1)*36/allCount)):notes;
  const count=visibleNotes.length;
  $('cw-graph-caption').textContent=allCount+(allCount>36?' nodes · 36 sampled':' nodes');
  if(count===0)return;
  const positions=visibleNotes.map((pitch,i)=>({pitch,x:230+138*Math.cos(-Math.PI/2+2*Math.PI*i/count),y:184+135*Math.sin(-Math.PI/2+2*Math.PI*i/count)}));
  const highlight=new Set(absoluteChord());
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
    const a=positions[i],b=positions[j];
    const connected=highlight.has(a.pitch)&&highlight.has(b.pitch);
    const edge=svgElement('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'cw-edge'+(connected?' is-active':'')},graph);
    const label=svgElement('title',{},edge);label.textContent=formatNumber(cents(mod(b.pitch-a.pitch,state.edo),state.edo),1)+' cents';
  }
  positions.forEach(p=>{
    const el=svgElement('circle',{cx:p.x,cy:p.y,r:count>30?5:count>15?7:11,fill:p.pitch===state.pitch?'#d3b1f2':highlight.has(p.pitch)?'#9b75b8':'#5a8195',class:'cw-node',role:'button',tabindex:0,'aria-label':'Pitch step '+p.pitch},graph);
    el.addEventListener('click',()=>chooseStep(p.pitch));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseStep(p.pitch);}});
    if(count<=24){const t=svgElement('text',{x:p.x,y:p.y+3,'text-anchor':'middle','font-size':'10',fill:'#fff','pointer-events':'none'},graph);t.textContent=p.pitch;}
  });
}
function renderMetrics(){
  const metrics=comparePitchSets(absoluteScale(),absoluteChord(),state.edo);
  const entries=[['Shared',metrics.commonCount],['Nearest',metrics.nearestCentsLeftToRight===null?'—':formatNumber(metrics.nearestCentsLeftToRight,1)+' ¢'],['Intervals',metrics.matchingIntervalPairs]];
  $('cw-metrics').replaceChildren();
  for(const [label,value] of entries){
    const box=document.createElement('div');box.className='cw-metric';
    const strong=document.createElement('strong');strong.textContent=String(value);
    const small=document.createElement('small');small.textContent=label;box.append(strong,small);$('cw-metrics').append(box);
  }
  const related=$('cw-camelot-related');related.replaceChildren();
  if(state.edo===12&&state.mode==='mixing'){
    for(const r of camelotRelated(state.camelot)){
      const btn=document.createElement('button');btn.type='button';btn.textContent=r.label+' · '+r.code;btn.title=camelotName(r.code);btn.addEventListener('click',()=>setCamelot(r.code));related.append(btn);
    }
  }
  $('cw-frequency').textContent=formatNumber(frequency(state.pitch,state.edo,state.reference),2)+' Hz';
  $('cw-offset').textContent=formatNumber(cents(state.pitch,state.edo),2)+' ¢ above reference';
}
function renderTable(){
  const head=$('cw-table-head'),body=$('cw-table-body');head.replaceChildren();body.replaceChildren();
  const camelot=state.edo===12&&state.mode==='mixing';
  $('cw-table-title').textContent=camelot?'Camelot key conversion':'Step / cents / frequency';
  const headings=camelot?['Camelot','Minor (A)','Major (B)']:['Step','Cents','Frequency (Hz)'];
  const tr=document.createElement('tr');
  headings.forEach(text=>{const th=document.createElement('th');th.textContent=text;tr.append(th);});head.append(tr);
  for(let i=0;i<(camelot?12:Math.min(state.edo,4096));i++){
    const row=document.createElement('tr');
    const values=camelot?[String(i+1),camelotName((i+1)+'A'),camelotName((i+1)+'B')]:[String(i),formatNumber(cents(i,state.edo),3),formatNumber(frequency(i,state.edo,state.reference),3)];
    for(const value of values){const td=document.createElement('td');td.textContent=value;row.append(td);}body.append(row);
  }
  $('cw-table-count').textContent=(camelot?12:state.edo)+' rows';
}
function render(){
  $('cw-mixing').classList.toggle('is-on',state.mode==='mixing');$('cw-mixing').setAttribute('aria-pressed',String(state.mode==='mixing'));
  $('cw-explore').classList.toggle('is-on',state.mode==='explore');$('cw-explore').setAttribute('aria-pressed',String(state.mode==='explore'));
  $('cw-generator-wrap').hidden=state.layout!=='generator'||state.edo===12&&state.mode==='mixing';
  $('cw-custom-wrap').hidden=$('cw-system').value!=='custom';
  $('cw-generator').max=String(state.edo-1);
  $('cw-interval').max=String(state.edo-1);
  renderWheel();renderGraph();renderMetrics();renderTable();
  $('cw-notes').replaceChildren();
  absoluteScale().forEach(x=>{const el=document.createElement('span');el.textContent=String(x);$('cw-notes').append(el);});
}
function populatePresets(){
  const preset=$('cw-preset');preset.replaceChildren();
  const custom=document.createElement('option');custom.value='custom';custom.textContent='Custom';preset.append(custom);
  for(const p of scalePresets(state.edo)){const el=document.createElement('option');el.value=p.id;el.textContent=p.name;preset.append(el);}
  const root=$('cw-root');root.replaceChildren();
  for(let i=0;i<state.edo;i++){const option=document.createElement('option');option.value=String(i);option.textContent=String(i);root.append(option);}
  root.value=String(state.root);preset.value='custom';
}
function updateScale(){
  try{
    const strings=$('cw-scale').value.split(',').map(x=>x.trim());
    if(strings.some(x=>!/^[-+]?\d+$/.test(x)))throw new Error('Use integer steps separated by commas.');
    state.scale=normalizeSteps(strings.map(Number),state.edo);
    $('cw-scale').value=state.scale.join(',');$('cw-preset').value='custom';render();status('');
  }catch(e){status(e.message);}
}
function updateChord(){
  try{
    const strings=$('cw-chord').value.split(',').map(x=>x.trim());
    if(strings.some(x=>!/^[-+]?\d+$/.test(x)))throw new Error('Use integer chord steps.');
    state.chord=normalizeSteps(strings.map(Number),state.edo);$('cw-chord').value=state.chord.join(',');render();status('');
  }catch(e){status(e.message);}
}
function configureEdo(n){
  state.edo=validateEdo(n);state.root=0;state.pitch=0;state.generator=fifthGenerator(state.edo);
  state.interval=state.generator;state.scale=scalePresets(state.edo)[1].steps;state.chord=normalizeSteps([0,Math.round(state.edo/4),state.generator],state.edo);
  $('cw-generator').value=state.generator;$('cw-interval').value=state.interval;
  $('cw-scale').value=state.scale.join(',');$('cw-chord').value=state.chord.join(',');
  $('cw-zoom').value=String(Math.min(state.edo,240));
  populatePresets();render();
}
function clearVoices(){
  for(const timeout of pendingTimers)clearTimeout(timeout);pendingTimers=[];
  for(const voice of voices){try{voice.osc.stop();}catch{}try{voice.osc.disconnect();voice.gain.disconnect();}catch{}}voices=[];
}
async function enableAudio(){
  if(audioEnabled){clearVoices();audioEnabled=false; if(audioContext){await audioContext.suspend();} $('cw-enable-audio').textContent='Enable audio';$('cw-enable-audio').setAttribute('aria-pressed','false');$('cw-audio-status').textContent='Audio disabled.';return;}
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx){status('Web Audio is unavailable in this browser.');return;}
  try{audioContext=audioContext||new Ctx();await audioContext.resume();audioEnabled=true;$('cw-enable-audio').textContent='Disable audio';$('cw-enable-audio').setAttribute('aria-pressed','true');$('cw-audio-status').textContent='Audio enabled.';}catch{status('Audio could not be started.');}
}
function playNotes(steps,duration=state.duration){
  if(!audioEnabled||!audioContext){$('cw-audio-status').textContent='Enable audio to audition.';return;}
  const now=audioContext.currentTime;const volume=state.volume/Math.max(1,Math.sqrt(steps.length));
  for(const pitch of steps){
    const hz=frequency(pitch,state.edo,state.reference);
    if(hz<15||hz>18000)continue;
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.type=state.wave;osc.frequency.setValueAtTime(hz,now);gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(volume,now+.014);
    gain.gain.setValueAtTime(volume,now+Math.max(.03,duration-.05));
    gain.gain.linearRampToValueAtTime(0,now+duration);
    osc.connect(gain).connect(audioContext.destination);osc.start(now);osc.stop(now+duration+.02);
    const voice={osc,gain};voices.push(voice);osc.onended=()=>{voices=voices.filter(v=>v!==voice);osc.disconnect();gain.disconnect();};
  }
}
function serialized(){
  return {version:1,edo:state.edo,layout:state.layout,generator:state.generator,reference:state.reference,mode:state.mode,
    root:state.root,pitch:state.pitch,camelot:state.camelot,scale:state.scale,chord:state.chord,interval:state.interval,wave:state.wave,volume:state.volume,duration:state.duration};
}
function loadConfiguration(value){
  if(!value||value.version!==1)throw new Error('Unsupported configuration version.');
  const edo=validateEdo(value.edo),reference=validateReference(value.reference);
  if(!['chromatic','generator'].includes(value.layout)||!['mixing','explore'].includes(value.mode))throw new Error('Invalid layout or mode');
  if(!['sine','triangle','sawtooth','square'].includes(value.wave))throw new Error('Invalid waveform');
  if(!/^(1[0-2]|[1-9])[AB]$/.test(value.camelot))throw new Error('Invalid Camelot key');
  const generator=Number(value.generator);
  generatorCycles(edo,generator);
  const root=Number(value.root),pitch=Number(value.pitch),interval=Number(value.interval),volume=Number(value.volume),duration=Number(value.duration);
  if(![root,pitch,interval].every(Number.isSafeInteger)||!Number.isFinite(volume)||volume<0||volume>.22||!Number.isFinite(duration)||duration<.1||duration>4)throw new Error('Invalid numeric settings');
  const scale=normalizeSteps(value.scale,edo),chord=normalizeSteps(value.chord,edo);
  state={...state,edo,reference,layout:value.layout,mode:value.mode,generator,root:mod(root,edo),pitch:mod(pitch,edo),interval:mod(interval,edo),camelot:value.camelot,scale,chord,wave:value.wave,volume,duration};
  $('cw-system').value=[12,19,24,31].includes(edo)?String(edo):'custom';
  $('cw-custom-n').value=edo;$('cw-layout').value=state.layout;$('cw-generator').value=generator;$('cw-reference').value=reference;
  $('cw-scale').value=scale.join(',');$('cw-chord').value=chord.join(',');$('cw-interval').value=interval;$('cw-wave').value=state.wave;
  $('cw-volume').value=volume;$('cw-duration').value=duration;$('cw-zoom').value=Math.min(edo,240);
  populatePresets();render();status('Configuration loaded.');
}
$('cw-system').addEventListener('change',()=>{try{configureEdo($('cw-system').value==='custom'?num($('cw-custom-n').value):num($('cw-system').value));}catch(e){status(e.message);}});
$('cw-custom-n').addEventListener('change',()=>{try{configureEdo(num($('cw-custom-n').value));}catch(e){status(e.message);}});
$('cw-layout').addEventListener('change',()=>{state.layout=$('cw-layout').value;render();});
$('cw-generator').addEventListener('change',()=>{try{generatorCycles(state.edo,num($('cw-generator').value));state.generator=num($('cw-generator').value);render();status('');}catch(e){status(e.message);}});
$('cw-reference').addEventListener('change',()=>{try{state.reference=validateReference($('cw-reference').value);render();status('');}catch(e){status(e.message);}});
$('cw-mixing').addEventListener('click',()=>{state.mode='mixing';render();});
$('cw-explore').addEventListener('click',()=>{state.mode='explore';render();});
$('cw-zoom').addEventListener('input',renderWheel);
$('cw-root').addEventListener('change',()=>{state.root=num($('cw-root').value);render();});
$('cw-preset').addEventListener('change',()=>{const p=scalePresets(state.edo).find(x=>x.id===$('cw-preset').value);if(p){state.scale=p.steps;$('cw-scale').value=p.steps.join(',');render();}});
$('cw-scale').addEventListener('change',updateScale);
$('cw-chord').addEventListener('change',updateChord);
$('cw-enable-audio').addEventListener('click',enableAudio);
$('cw-wave').addEventListener('change',()=>state.wave=$('cw-wave').value);
$('cw-volume').addEventListener('input',()=>state.volume=num($('cw-volume').value));
$('cw-interval').addEventListener('change',()=>{state.interval=mod(num($('cw-interval').value)||0,state.edo);});
$('cw-duration').addEventListener('change',()=>state.duration=Math.min(4,Math.max(.1,num($('cw-duration').value)||.45)));
$('cw-play-pitch').addEventListener('click',()=>playNotes([state.pitch]));
$('cw-play-interval').addEventListener('click',()=>playNotes([state.pitch,state.pitch+state.interval]));
$('cw-play-chord').addEventListener('click',()=>playNotes(absoluteChord()));
$('cw-play-scale').addEventListener('click',()=>{
  clearVoices();const notes=absoluteScale();if(!audioEnabled){$('cw-audio-status').textContent='Enable audio to audition.';return;}
  notes.forEach((note,i)=>pendingTimers.push(setTimeout(()=>playNotes([note]),i*state.duration*700)));
});
$('cw-stop').addEventListener('click',()=>{clearVoices();$('cw-audio-status').textContent='Stopped.';});
$('cw-share').addEventListener('click',async()=>{
  const url=new URL(location.href);url.searchParams.set('cw',btoa(JSON.stringify(serialized())).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,''));
  try{await navigator.clipboard.writeText(url.href);status('Share URL copied.');}catch{status('Share URL: '+url.href);}
});
$('cw-save').addEventListener('click',()=>{try{localStorage.setItem('camelot-explorer-v1',JSON.stringify(serialized()));status('Saved in this browser.');}catch{status('Local storage is unavailable.');}});
$('cw-load').addEventListener('click',()=>{try{const raw=localStorage.getItem('camelot-explorer-v1');if(!raw)throw new Error('No saved configuration.');loadConfiguration(JSON.parse(raw));}catch(e){status(e.message);}});
populatePresets();
try{const raw=new URL(location.href).searchParams.get('cw');if(raw){const base64=raw.replaceAll('-','+').replaceAll('_','/');loadConfiguration(JSON.parse(atob(base64)));}}catch(e){status('Invalid shared configuration: '+e.message);}
render();

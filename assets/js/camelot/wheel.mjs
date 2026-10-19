import {mod,camelotName,camelotRelated,frequency} from './tuning.mjs';
const $=id=>document.getElementById(id);
const colors=['#b44869','#a45777','#936489','#81709b','#687da5','#508da3','#469b94','#52a083','#77a466','#a4a05a','#b69152','#b6754d'];
let selected='8A',context=null,voices=[],generation=0;
const polar=(r,a)=>[280+r*Math.cos(a),280+r*Math.sin(a)];
const sector=(r1,r2,a,b)=>'M'+polar(r2,a)+' A'+r2+','+r2+' 0 0 1 '+polar(r2,b)+' L'+polar(r1,b)+' A'+r1+','+r1+' 0 0 0 '+polar(r1,a)+' Z';
function svg(tag,attrs,parent,text){
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));
  if(text)el.textContent=text;
  parent.append(el);return el;
}
export function chordSteps(code){
  camelotName(code);
  const major=code.endsWith('B');
  const root=mod((Number(code.slice(0,-1))-8)*7+(major?3:0),12);
  return [root,root+(major?4:3),root+7];
}
function stop(){
  generation++;
  for(const voice of voices){try{voice.osc.stop();}catch{}voice.osc.disconnect();voice.gain.disconnect();}
  voices=[];
}
async function play(){
  stop();const request=generation,code=selected;
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx){$('cw-audio-status').textContent='Web Audio is unavailable in this browser.';return;}
  try{
    context=context||new Ctx();
    if(context.state!=='running')await context.resume();
    if(request!==generation)return;
    if(context.state!=='running')throw new Error('Audio suspended');
    const now=context.currentTime,volume=Number($('cw-volume').value)/Math.sqrt(3);
    for(const step of chordSteps(code)){
      const osc=context.createOscillator(),gain=context.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(frequency(step,12,440),now);
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.014);
      gain.gain.setValueAtTime(volume,now+.4);gain.gain.linearRampToValueAtTime(0,now+.45);
      osc.connect(gain).connect(context.destination);osc.start(now);osc.stop(now+.47);
      const voice={osc,gain};voices.push(voice);
      osc.onended=()=>{voices=voices.filter(v=>v!==voice);osc.disconnect();gain.disconnect();};
    }
    $('cw-audio-status').textContent=volume===0?'Volume is zero — raise Volume to hear sound.':'Playing '+code+' · '+camelotName(code);
  }catch{$('cw-audio-status').textContent='Audio could not start. Tap Play to try again.';}
}
function select(code){selected=code;render();play();}
function render(){
  const wheel=$('cw-wheel'),related=camelotRelated(selected),allowed=new Set(related.map(r=>r.code));
  // Keep SVG nodes stable so keyboard focus survives selection.
  if(!wheel.children.length){
    for(let i=0;i<12;i++)for(const kind of ['B','A']){
      const code=(mod(i+7,12)+1)+kind;
      const [inner,outer]=kind==='A'?[105,177]:[178,254];
      const a=-Math.PI/2+i*2*Math.PI/12,b=a+2*Math.PI/12;
      const path=svg('path',{d:sector(inner,outer,a,b),fill:colors[i],role:'button',tabindex:0,'data-code':code,'aria-label':code+' · '+camelotName(code)},wheel);
      path.addEventListener('click',()=>select(code));
      path.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();select(code);}
        else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
          e.preventDefault();const all=[...wheel.querySelectorAll('[data-code]')];
          all[mod(all.indexOf(path)+(e.key==='ArrowRight'?1:-1),all.length)].focus();
        }
      });
      const [x,y]=polar((inner+outer)/2,(a+b)/2);
      svg('text',{x,y,class:'cw-label'},wheel,code);
    }
    svg('circle',{cx:280,cy:280,r:101,fill:'#15121d',stroke:'#574b62','stroke-width':2},wheel);
    svg('text',{x:280,y:280,class:'cw-center'},wheel,'CAMELOT');
  }
  for(const path of wheel.querySelectorAll('[data-code]')){
    const code=path.getAttribute('data-code');
    path.setAttribute('class','cw-segment '+(code===selected?'is-selected':allowed.has(code)?'is-compatible':'is-faded'));
    path.setAttribute('aria-pressed',String(code===selected));
  }
  $('cw-selected').textContent=selected+' · '+camelotName(selected);
  const list=$('cw-camelot-related');list.replaceChildren();
  for(const r of related){const button=document.createElement('button');button.type='button';button.textContent=r.label+' · '+r.code+' · '+camelotName(r.code);button.addEventListener('click',()=>select(r.code));list.append(button);}
}
$('cw-play-selected').addEventListener('click',play);
$('cw-stop').addEventListener('click',()=>{stop();$('cw-audio-status').textContent='Stopped.';});
render();

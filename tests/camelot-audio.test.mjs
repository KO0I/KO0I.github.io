import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as tuning from '../assets/js/camelot/tuning.mjs';

function harness({blocked=false}={}){
  const nodes=new Map(),played=[];
  const element=()=>({textContent:'',value:'',checked:false,handlers:{},children:[],attrs:{},
    addEventListener(event,fn){this.handlers[event]=fn;},setAttribute(k,v){this.attrs[k]=v;},
    append(...items){this.children.push(...items);},replaceChildren(){this.children=[];}});
  const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
  class AudioContext{
    state='suspended';currentTime=0;destination={};
    async resume(){if(blocked)throw new Error('blocked');this.state='running';}
    async suspend(){this.state='suspended';}
    createOscillator(){return {frequency:{setValueAtTime(hz){played.push(hz);}},connect(node){return node;},start(){},stop(){},disconnect(){}};}
    createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}};}
  }
  let source=readFileSync(new URL('../assets/js/camelot/app.mjs',import.meta.url),'utf8').replace(/^import[\s\S]*?from '\.\/tuning.mjs';/,'');
  source=source.slice(0,source.lastIndexOf('\npopulatePresets();'))+'\nrender=()=>{};';
  const context=vm.createContext({...tuning,document:{getElementById:get,createElement:element,createElementNS:element},window:{AudioContext},setTimeout,clearTimeout});
  vm.runInContext(source,context);
  return {played,get,run:code=>vm.runInContext(code,context),click:id=>get(id).handlers.click()};
}
test('Play starts suspended audio without a separate enable step',async()=>{
  const h=harness();await h.click('cw-play-selected');
  assert.equal(h.played.length,3);assert.equal(h.played[0],440);
  assert.match(h.get('cw-audio-status').textContent,/Playing/);
});
test('Camelot selection auditions correct major and minor triads',async()=>{
  const h=harness();
  h.run("setCamelot('8B')");await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(h.played,[3,7,10].map(s=>tuning.frequency(s,12,440)));
  h.played.length=0;h.run("setCamelot('9A')");await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(h.played,[7,10,14].map(s=>tuning.frequency(s,12,440)));
});
test('Explore tap and replay after muting both start audio',async()=>{
  const h=harness();h.run('chooseStep(2)');await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.played.length,1);await h.click('cw-enable-audio');
  await h.click('cw-play-pitch');assert.equal(h.played.length,2);
});
test('Blocked audio reports a visible retry instruction',async()=>{
  const h=harness({blocked:true});await h.click('cw-play-selected');
  assert.equal(h.played.length,0);assert.match(h.get('cw-audio-status').textContent,/Tap Play/);
});

test('Sound settings chord and graph follow the Camelot key',async()=>{
  const h=harness();
  h.run("setCamelot('9B')");await new Promise(resolve=>setImmediate(resolve));
  h.played.length=0;await h.click('cw-play-chord');
  assert.deepEqual(h.played,[10,14,17].map(s=>tuning.frequency(s,12)));
  h.run('renderGraph()');
  const active=h.get('cw-graph').children.filter(n=>n.attrs.class==='cw-edge is-active');
  assert.equal(active.length,3);
  assert.equal(h.get('cw-root').value,'10');
  assert.equal(h.get('cw-chord').value,'0,4,7');
  const before=JSON.stringify(active.map(n=>n.attrs));
  h.run("setCamelot('8A');renderGraph()");
  assert.notEqual(JSON.stringify(h.get('cw-graph').children.filter(n=>n.attrs.class==='cw-edge is-active').map(n=>n.attrs)),before);
});
test('EDO selection and root transpose the sound-settings chord and graph',async()=>{
  const h=harness();h.run('configureEdo(19);chooseStep(5)');
  await new Promise(resolve=>setImmediate(resolve));h.played.length=0;
  await h.click('cw-play-chord');
  assert.deepEqual(h.played,[5,10,16].map(s=>tuning.frequency(s,19)));
  h.run('renderGraph()');assert.match(h.get('cw-graph-caption').textContent,/19-EDO · root 5/);
  const before=JSON.stringify(h.get('cw-graph').children.map(n=>n.attrs));
  h.run('configureEdo(31);chooseStep(7)');
  await new Promise(resolve=>setImmediate(resolve));h.played.length=0;
  await h.click('cw-play-chord');
  assert.deepEqual(h.played,[7,15,25].map(s=>tuning.frequency(s,31)));
  h.run('renderGraph()');assert.match(h.get('cw-graph-caption').textContent,/31-EDO · root 7/);
  assert.notEqual(JSON.stringify(h.get('cw-graph').children.map(n=>n.attrs)),before);
});

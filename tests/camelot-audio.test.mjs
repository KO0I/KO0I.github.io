import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as tuning from '../assets/js/camelot/tuning.mjs';

function harness({blocked=false}={}){
  const nodes=new Map(),played=[];
  const get=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',value:'',checked:false,handlers:{},addEventListener(event,fn){this.handlers[event]=fn;},setAttribute(){}});return nodes.get(id);};
  class AudioContext{
    state='suspended';currentTime=0;destination={};
    async resume(){if(blocked)throw new Error('blocked');this.state='running';}
    async suspend(){this.state='suspended';}
    createOscillator(){return {frequency:{setValueAtTime(hz){played.push(hz);}},connect(node){return node;},start(){},stop(){},disconnect(){}};}
    createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}};}
  }
  let source=readFileSync(new URL('../assets/js/camelot/app.mjs',import.meta.url),'utf8').replace(/^import[\s\S]*?from '\.\/tuning.mjs';/,'');
  source=source.slice(0,source.lastIndexOf('\npopulatePresets();'))+'\nrender=()=>{};';
  const context=vm.createContext({...tuning,document:{getElementById:get},window:{AudioContext},setTimeout,clearTimeout});
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

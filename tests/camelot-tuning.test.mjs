import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEdo,validateReference,mod,cents,frequency,centsBetween,gcd,fifthGenerator,
  generatorCycles,wheelOrder,normalizeSteps,transposeSteps,rotateMode,
  scalePresets,intervalClass,circularDistance,intervalHistogram,comparePitchSets,
  camelotName,camelotRelated
} from '../assets/js/camelot/tuning.mjs';

test('EDO and reference constraints reject invalid values',()=>{
  assert.equal(validateEdo(19),19);
  for(const n of [0,1,4097,2.5,Infinity,NaN])assert.throws(()=>validateEdo(n));
  assert.equal(validateReference(440),440);
  for(const n of [0,-1,Infinity,20001])assert.throws(()=>validateReference(n));
});
test('frequency math matches 12-EDO and finer EDO references',()=>{
  assert.ok(Math.abs(frequency(12,12,440)-880)<1e-9);
  assert.ok(Math.abs(frequency(-12,12,440)-220)<1e-9);
  assert.ok(Math.abs(frequency(7,12,440)-659.2551138257398)<1e-8);
  assert.ok(Math.abs(cents(1,31)-1200/31)<1e-12);
  assert.ok(Math.abs(centsBetween(440,880)-1200)<1e-12);
  assert.ok(Math.abs(frequency(19,19)-880)<1e-9);
});
test('mod, generator and disconnected cycles',()=>{
  assert.equal(mod(-1,12),11);
  assert.equal(gcd(12,8),4);
  assert.equal(fifthGenerator(12),7);
  assert.equal(generatorCycles(12,7).length,1);
  assert.equal(generatorCycles(12,4).length,4);
  assert.equal(generatorCycles(12,4).flat().length,12);
  assert.deepEqual(wheelOrder(6,'generator',2),[0,2,4,1,3,5]);
  assert.throws(()=>generatorCycles(12,0));
});
test('custom scales normalize, transpose, and rotate',()=>{
  assert.deepEqual(normalizeSteps([-1,0,19,20,5,5],19),[0,1,5,18]);
  assert.deepEqual(transposeSteps([0,3,7],5,12),[0,5,8]);
  assert.deepEqual(rotateMode([0,2,4,5,7,9,11],1,12),[0,2,3,5,7,9,10]);
  assert.equal(scalePresets(19).find(s=>s.id==='diatonic19').steps.length,7);
  assert.throws(()=>normalizeSteps([1.5],19));
});
test('compatibility returns separate measurements without scalar score',()=>{
  const c=comparePitchSets([0,4,7],[0,3,7],12);
  assert.equal(c.commonCount,2);
  assert.deepEqual(c.common,[0,7]);
  assert.equal(c.nearestCentsLeftToRight,100/3);
  assert.equal(c.nearestCentsRightToLeft,100/3);
  assert.ok(c.matchingIntervalPairs>=0);
  assert.equal(Object.hasOwn(c,'score'),false);
  assert.equal(intervalClass(0,11,12),1);
  assert.equal(circularDistance(0,11,12),100);
  assert.equal(intervalHistogram([0,4,7],12).size,3);
  assert.equal(comparePitchSets([],[],12).nearestCentsLeftToRight,null);
});
test('all 24 Camelot names and basic transitions',()=>{
  const major=['B','F♯','D♭','A♭','E♭','B♭','F','C','G','D','A','E'];
  for(let n=1;n<=12;n++){
    assert.match(camelotName(n+'A'),/minor/);
    assert.ok(camelotName(n+'B').startsWith(major[n-1]));
    assert.equal(camelotRelated(n+'A').length,4);
  }
  assert.deepEqual(camelotRelated('8A').map(x=>x.code),['8A','8B','7A','9A']);
  assert.deepEqual(camelotRelated('1B').map(x=>x.code),['1B','1A','12B','2B']);
  assert.throws(()=>camelotName('13A'));
});

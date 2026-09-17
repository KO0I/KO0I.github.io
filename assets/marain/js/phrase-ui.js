(function () {
  'use strict';
  function init() {
    const input=document.getElementById('marainPhraseInput');
    if(!input || !window.MarainPhrases)return;
    const roman=document.getElementById('marainPhraseRoman');
    const glyphs=document.getElementById('marainPhraseGlyphs');
    const status=document.getElementById('marainPhraseStatus');
    const details=document.getElementById('marainPhraseDetails');
    const list=document.getElementById('marainPhraseMatches');
    function update() {
      const r=window.MarainPhrases.translate(input.value);
      roman.textContent=r.roman;glyphs.replaceChildren();details.replaceChildren();list.replaceChildren();
      r.segments.forEach(s=>{
        const el=document.createElement('span');
        el.className=s.unknown?'marain-unknown':s.plain?'marain-punctuation':'marain';
        el.textContent=s.text;glyphs.append(el);
      });
      status.textContent={empty:'Enter a short phrase to begin.',attested:'Lesson example',draft:'Grammar-based draft — review the interpretation below.',partial:'Partial match — unknown or ambiguous vocabulary appears as <??>.'}[r.mode];
      if(r.missing.length) {
        const p=document.createElement('p');p.textContent='Unresolved: '+r.missing.join(', ');details.append(p);
      }
      [...r.rules,...r.notes].forEach(note=>{const p=document.createElement('p');p.textContent=note;details.append(p);});
      r.alignment.forEach(item=>{
        const tr=document.createElement('tr');
        [item.english,item.marain,item.reason].forEach(text=>{const td=document.createElement('td');td.textContent=text;tr.append(td);});
        list.append(tr);
      });
    }
    input.addEventListener('input',update);
    document.querySelectorAll('[data-marain-example]').forEach(button=>button.addEventListener('click',()=>{
      input.value=button.dataset.marainExample;update();input.focus();
    }));
    const copy=document.getElementById('marainPhraseCopy');
    copy.addEventListener('click',async()=>{
      try {await navigator.clipboard.writeText(roman.textContent);copy.textContent='Copied';}
      catch {copy.textContent='Select the Romanised text to copy';}
      setTimeout(()=>{copy.textContent='Copy Romanised text';},2500);
    });
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}());

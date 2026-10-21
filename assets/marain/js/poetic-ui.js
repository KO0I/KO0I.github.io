/* Opt-in poetic transformations; regular English -> Marain translation is unchanged. */
(function () {
  'use strict';
  function init() {
    const input=document.getElementById('poetic-stem');
    const selector=document.getElementById('poetic-kind');
    const roman=document.getElementById('poetic-output-roman');
    const glyphs=document.getElementById('poetic-output-glyphs');
    const status=document.getElementById('poetic-status');
    const api=window.MarainPhrases;
    if(!input||!selector||!roman||!glyphs||!status||!api)return;
    function update() {
      const word=input.value.trim().replace(/[’‘]/g,"'");
      const key=word && !/\s/.test(word) ? api.encode(word) : null;
      const mode=selector.value;
      const mutation=mode==='mutation';
      const parts=mode.split(':');
      const form=key ? (mutation ? api.poeticMutate('po',key) : api.poeticCadence(key,parts[0],parts[1])) : null;
      if(!form) {
        roman.textContent='';
        glyphs.textContent='';
        status.textContent='No unambiguous poetic form for that dictionary headword and choice. Try uprahay for cadence or pren for mutation.';
        return;
      }
      const canonical=api.romanize(key);
      if(mutation) {
        roman.textContent='po '+form.roman;
        glyphs.textContent='po '+form.key;
        status.textContent='Poetic mutation after po; underlying dictionary phrase: po '+canonical+'. This form is a proposal.';
      } else {
        roman.textContent=form.roman;
        glyphs.textContent=form.glyphKey;
        const label=parts[0]==='prospective'?'planned event':'consequent event';
        status.textContent='Poetic cadence '+parts[1]+'; same meaning ('+label+') as '+api.predicateSuffix(key,parts[0]).roman+'. This form is a proposal.';
      }
    }
    input.addEventListener('input',update);
    selector.addEventListener('change',update);
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
}());

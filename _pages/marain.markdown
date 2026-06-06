---
layout: page
title: Marain
permalink: /marain/
---

<link rel="stylesheet" href="{{ '/assets/marain/css/marain.css' | relative_url }}">

<script src="{{ '/assets/marain/js/jquery.min.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/dict.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/sentences.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/alpha.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/marain-tools.js' | relative_url }}"></script>

# Marain Dictionary

<div class="marain-page">

<div id="english-to-marain" class="dictionary-panel">
  <h2>English → Marain</h2>

  <p>
    Enter English words. Known dictionary words will be converted into Marain.
  </p>

  <label for="englishfield">English words</label>

  <input
    type="text"
    maxlength="144"
    id="englishfield"
    autocomplete="off"
    autocorrect="on"
    autocapitalize="off"
    spellcheck="true"
    placeholder="spaceship culture speak">

  <div class="translation-result">
    <h3>Marain (Romanised)</h3>
    <div id="englishMarainRoman" class="roman-output"></div>

    <h3>Marain</h3>
    <div id="englishMarainGlyphs" class="marain marain-output"></div>

    <div id="englishMarainNotes" class="translation-notes"></div>
  </div>
</div>

  <p>
    Look up Marain words 
  </p>

  <div id="dictionary">
    <h2>Dictionary</h2>

    <label for="dictsearch">Search romanized Marain</label>

    <input
      type="text"
      maxlength="32"
      id="dictsearch"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      placeholder="pren">

    <div class="dictionary-result">
      <div class="marain" id="dictmarain">pren</div>

      <div>
        <span id="dictroman">pren</span>
        <span id="ipa">/<span class="ipa" id="dictipa">prɛn</span>/</span>
        <span id="dictpos">noun</span>
      </div>

      <p id="dictdef">spaceship</p>
    </div>

    <div id="seealso"></div>
  </div>

</div>

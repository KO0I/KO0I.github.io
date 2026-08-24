---
layout: page
#hero_title: Marain <span class="marain">(marain)</span>
title: Marain <span class="marain">(marain)</span>
marain_title: "(marain)"
permalink: /marain/
---

<link rel="stylesheet" href="{{ '/assets/marain/css/marain.css' | relative_url }}">

<script src="{{ '/assets/marain/js/jquery.min.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/dict.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/sentences.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/alpha.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/marain-tools.js' | relative_url }}"></script>

# Marain Dictionary

## Marain - Latin Symbol table:
| Latin | Marain |
|:-----:|:------:|
| A | <span class="marain">a</span> |
| B | <span class="marain">b</span> |
| C | <span class="marain">c</span> |
| D | <span class="marain">d</span> |
| E | <span class="marain">e</span> |
| F | <span class="marain">f</span> |
| G | <span class="marain">g</span> |
| H | <span class="marain">h</span> |
| I | <span class="marain">i</span> |
| J | <span class="marain">j</span> |
| K | <span class="marain">k</span> |
| L | <span class="marain">l</span> |
| M | <span class="marain">m</span> |
| N | <span class="marain">n</span> |
| O | <span class="marain">o</span> |
| P | <span class="marain">p</span> |
| Q | <span class="marain">q</span> |
| R | <span class="marain">r</span> |
| S | <span class="marain">s</span> |
| T | <span class="marain">t</span> |
| U | <span class="marain">u</span> |
| V | <span class="marain">v</span> |
| W | <span class="marain">w</span> |
| X | <span class="marain">x</span> |
| Y | <span class="marain">y</span> |
| Z | <span class="marain">z</span> |
| 0 | <span class="marain">0</span> |
| 1 | <span class="marain">1</span> |
| 2 | <span class="marain">2</span> |
| 3 | <span class="marain">3</span> |
| 4 | <span class="marain">4</span> |
| 5 | <span class="marain">5</span> |
| 6 | <span class="marain">6</span> |
| 7 | <span class="marain">7</span> |
| 8 | <span class="marain">8</span> |
| 9 | <span class="marain">9</span> |

## Translation

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

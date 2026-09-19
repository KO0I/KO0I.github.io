---
layout: page
#hero_title: Marain <span class="marain">(marain)</span>
title: Marain
marain_title: "(marain)"
permalink: /marain/
---

<link rel="stylesheet" href="{{ '/assets/marain/css/marain.css' | relative_url }}">

<script src="{{ '/assets/marain/js/jquery.min.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/dict.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/sentences.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/alpha.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/marain-tools.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/phrase-translator.js' | relative_url }}"></script>
<script src="{{ '/assets/marain/js/phrase-ui.js' | relative_url }}" defer></script>
<script src="{{ '/assets/marain/js/marain-display.js' | relative_url }}" defer></script>
<script src="{{ '/assets/marain/js/marain-tabs.js' | relative_url }}" defer></script>

# <span class="marain">marain</span>

## Marain - Latin Symbol table:

| Latin | Marain | Latin | Marain |
|:-----:|:------:|:-----:|:------:|
| A | <span class="marain">a</span> | S | <span class="marain">s</span> |
| B | <span class="marain">b</span> | T | <span class="marain">t</span> |
| C | <span class="marain">c</span> | U | <span class="marain">u</span> |
| D | <span class="marain">d</span> | V | <span class="marain">v</span> |
| E | <span class="marain">e</span> | W | <span class="marain">w</span> |
| F | <span class="marain">f</span> | X | <span class="marain">x</span> |
| G | <span class="marain">g</span> | Y | <span class="marain">y</span> |
| H | <span class="marain">h</span> | Z | <span class="marain">z</span> |
| I | <span class="marain">i</span> | 0 | <span class="marain">0</span> |
| J | <span class="marain">j</span> | 1 | <span class="marain">1</span> |
| K | <span class="marain">k</span> | 2 | <span class="marain">2</span> |
| L | <span class="marain">l</span> | 3 | <span class="marain">3</span> |
| M | <span class="marain">m</span> | 4 | <span class="marain">4</span> |
| N | <span class="marain">n</span> | 5 | <span class="marain">5</span> |
| O | <span class="marain">o</span> | 6 | <span class="marain">6</span> |
| P | <span class="marain">p</span> | 7 | <span class="marain">7</span> |
| Q | <span class="marain">q</span> | 8 | <span class="marain">8</span> |
| R | <span class="marain">r</span> | 9 | <span class="marain">9</span> |

## Translation

<div class="marain-page">

<section id="phrase-translator" class="dictionary-panel" aria-labelledby="phrase-heading">
  <h2 id="phrase-heading">English phrases → Marain</h2>
  <p>Build a draft from known words and patterns in the community lessons. Unknown or ambiguous vocabulary stays visible as <code>&lt;??&gt;</code>. A complete word match does not guarantee a correct translation.</p>
  <label for="marainPhraseInput">English phrase</label>
  <textarea id="marainPhraseInput" rows="3" maxlength="2000" placeholder="I give a flower to you." aria-describedby="phrase-help"></textarea>
  <p id="phrase-help" class="translation-notes">Try a short statement, a “do you…?” question, or “I have…”. “You” is singular; “they” is plural. Unsupported structures receive word and phrase matches.</p>
  <div class="marain-examples" aria-label="Examples">
    <button type="button" data-marain-example="I speak Marain.">I speak Marain</button>
    <button type="button" data-marain-example="I have a flower.">I have a flower</button>
    <button type="button" data-marain-example="Do you speak Marain?">Do you speak Marain?</button>
    <button type="button" data-marain-example="I give a flower to you.">I give a flower to you</button>
    <button type="button" data-marain-example="I eat pizza.">Try an unknown word</button>
  </div>
  <div class="translation-result" aria-live="polite" aria-atomic="true">
    <p id="marainPhraseStatus" class="translation-notes"></p>
    <h3>Marain (Romanised)</h3>
    <div id="marainPhraseRoman" class="roman-output"></div>
    <h3>Marain</h3>
    <div id="marainPhraseGlyphs" class="marain-output" aria-label="Marain glyphs"></div>
  </div>
  <button type="button" id="marainPhraseCopy">Copy Romanised text</button>
  <details class="marain-interpretation">
    <summary>Matches and grammar used</summary>
    <div id="marainPhraseDetails" class="translation-notes"></div>
    <div class="marain-table-scroll">
      <table><thead><tr><th>English</th><th>Marain</th><th>Interpretation</th></tr></thead><tbody id="marainPhraseMatches"></tbody></table>
    </div>
  </details>
  <p class="translation-notes">This is a limited community-conlang assistant. Text stays in your browser.</p>
  <noscript><p>Enable JavaScript to use the phrase assistant. The grammar notes below remain available.</p></noscript>
</section>

<details class="dictionary-panel marain-rules">
  <summary>Grammar recovered from the lessons</summary>
  <p>These rules describe the supplied community lessons. They are not presented as a complete grammar established by Iain M. Banks.</p>
  <div class="marain-table-scroll">
    <table>
      <thead><tr><th>Function</th><th>Rule</th><th>Example</th></tr></thead>
      <tbody>
        <tr><td>Subject</td><td>-uh; -yuh after a vowel</td><td>ra → ra'yuh</td></tr>
        <tr><td>Object</td><td>-va</td><td>marayn → maraynva</td></tr>
        <tr><td>Recipient</td><td>-vihl</td><td>ge → gevihl</td></tr>
        <tr><td>Origin / location / companion</td><td>-sa / -li / -ye</td><td>prenli: in a spaceship</td></tr>
        <tr><td>Possession</td><td>yesayn + thing.NOM + holder.COM</td><td>yesayn lomra'yuh ra'ye</td></tr>
        <tr><td>Yes/no question</td><td>hanggra + clause</td><td>hanggra kabo geyuh maraynva</td></tr>
        <tr><td>Verb → noun</td><td>-i after a consonant; -wi after a vowel</td><td>nadeki; kabowi</td></tr>
        <tr><td>Number</td><td>Base eight; number + dam + noun</td><td>dosa dam uprayheva</td></tr>
      </tbody>
    </table>
  </div>
  <p>Cases carry grammatical roles. The assistant uses a consistent subject–verb–object order, while lesson examples also use other orders. Bare verbs do not establish English tense, aspect, or number agreement. Negation scope, complex clauses, and adjective agreement remain incomplete.</p>
  <p><a href="{{ '/lesson-rules/' | relative_url }}">Full rules, evidence, and vocabulary audit</a></p>
</details>


<div id="english-to-marain" class="dictionary-panel">
  <h2>English to Marain</h2>

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



</div>

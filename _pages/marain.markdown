---
layout: page
#hero_title: Marain <span class="marain">(marain)</span>
title: 
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
<script src="{{ '/assets/marain/js/base-conversion.js' | relative_url }}" defer></script>
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

<section id="base-conversion" class="dictionary-panel" aria-labelledby="base-heading">
<h2 id="base-heading">Decimal ↔ Nonary</h2>
<p>Enter a nonnegative whole number in either box. Decimal uses base 10; Marain uses base 9, also known as nonary. In the Marain box, both 0 and 9 mean zero and display as glyph 9.</p>
<label for="decimal-number">Decimal (base 10)</label>
<input id="decimal-number" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" value="0" aria-describedby="base-error">
<label for="marain-number">Actual Marain base-9 number</label>
<input id="marain-number" class="marain" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" value="9" aria-describedby="base-error marain-readable">
<p id="marain-readable">Marain digit keys: <output id="marain-keys">0</output></p>
<p id="base-error" role="status" aria-live="polite"></p>
<p>Example: typing <code>8090919</code> displays <code>8999919</code>, reads as base-9 <code>8000010</code>, and converts to decimal <code>4251537</code>.</p>
</section>

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
    <button type="button" data-marain-example="I can speak Marain.">I can speak Marain</button>
    <button type="button" data-marain-example="I must not speak Marain.">I must not speak Marain</button>
    <button type="button" data-marain-example="I would like to leave.">I would like to leave</button>
    <button type="button" data-marain-example="I think you should leave.">I think you should leave</button>
    <button type="button" data-marain-example="I plan to leave.">I plan to leave</button>
    <button type="button" data-marain-example="I am scheduled and obliged to leave.">I am scheduled and obliged to leave</button>
    <button type="button" data-marain-example="I would like to know, therefore it was imagined.">I would like to know…</button>
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
  <p>Cases carry grammatical roles. The assistant uses a consistent subject–verb–object order, while lesson examples also use other orders. Bare verbs do not establish English tense, aspect, or number agreement. Recovered negation scope, complex clauses, and adjective agreement remain incomplete; see the separate proposed extension below.</p>
  <p><a href="{{ '/lesson-rules/' | relative_url }}">Full rules, evidence, and vocabulary audit</a></p>
</details>


<details class="dictionary-panel marain-rules">
  <summary>Community grammar extension v0.2 — hypothetical mood and predicate chaining (proposed)</summary>
  <p>The following forms are <strong>new proposals, not recovered Banks canon</strong>. The existing <code>hanggra</code> question marker and the words <code>heth</code> (“believe”) and <code>tsha</code> (“think about”) are retained.</p>
  <p>Use zero-marked predicate chaining by default: <code>subject.NOM + modal/control verb + main verb</code>. The earlier <code>ke</code> particle is now <em>optional</em> for disambiguating complex complements.</p>
  <div class="marain-table-scroll"><table>
    <thead><tr><th>Meaning</th><th>Marain</th><th>Comment</th></tr></thead>
    <tbody>
      <tr><td>I want to leave</td><td><code>ra'yuh okehi uprahay nayla</code></td><td>Unmarked predicate chain</td></tr>
      <tr><td>I would like to leave</td><td><code>ra'yuh okehi'tcha uprahay nayla</code></td><td>Hypothetical desire, optionally polite</td></tr>
      <tr><td>I would leave</td><td><code>ra'yuh upraha'tcha nayla</code></td><td>Irrealis departure</td></tr>
      <tr><td>I could leave</td><td><code>ra'yuh funuf'tcha uprahay nayla</code></td><td>Irrealis ability</td></tr>
      <tr><td>I think you should leave</td><td><code>ra'yuh heth geyuh shuhztnuft uprahay nayla</code></td><td>Belief governs a proposition with its own nominative subject</td></tr>
    </tbody>
  </table></div>
  <p><strong>New suffix <code>'tcha</code>:</strong> Before adding it to a predicate, delete one final <code>ch</code>, <code>c</code>, <code>p</code>, <code>d</code>, <code>t</code>, or <code>y</code> (longest match first). Otherwise keep the complete stem. The apostrophe marks the romanized suffix boundary and is not a native glyph. Examples: <code>uprahay → upraha'tcha</code>, <code>funuft → funuf'tcha</code>, <code>okehi → okehi'tcha</code>, <code>nocht → noch'tcha</code>.</p>
  <p>The suffix is distinct from standalone <code>tcha</code> (“if”) and <code>hangtcha</code> (“counterfactual if”). The existing modal predicates <code>funuft</code>, <code>gihwinuft</code>, <code>shuhztnuft</code>, <code>kwemraku'ha</code>, <code>okehi</code>, and <code>ku'ha</code> retain their meanings. Place <code>hech</code> after the predicate whose scope is negated.</p>
  <p><a href="{{ '/assets/marain/marain-grammar-extension.md' | relative_url }}">Full grammar extension and examples</a>. The phrase tool implements a bounded subset; unfamiliar nested and counterfactual constructions still show partial matches.</p>
</details>

<details class="dictionary-panel marain-rules">
  <summary>Community grammar extension v0.3 — patientive, resultative, and prospective (proposed)</summary>
  <p><strong>Proposed language, not recovered canon.</strong> The new <code>-vuh</code> ending is a nominal patientive case; <code>'inayng</code> and <code>'wolug</code> are predicate-level markers, not ordinary noun cases.</p>
  <div class="marain-table-scroll"><table>
    <thead><tr><th>Function</th><th>Rule</th><th>Example</th></tr></thead>
    <tbody>
      <tr><td>Patientive (PAT)</td><td><code>noun-vuh</code>: undergoer is grammatical subject; agent unspecified</td><td><code>tovuh tshainsle bechumli</code> — it was imagined</td></tr>
      <tr><td>Resultative (RES)</td><td><code>predicate'inayng</code>: second clause is presented as a consequence of a prior proposition</td><td><code>tovuh tshainsle'inayng bechumli</code> — consequently, it was imagined</td></tr>
      <tr><td>Prospective (PROS)</td><td><code>predicate'wolug</code>: planned, scheduled, or intended but unrealized</td><td><code>ra'yuh uprahay'wolug nayla</code> — I plan to leave</td></tr>
      <tr><td>Future obligation</td><td><code>kwemraku'ha</code> (obligation) and <code>beyanli</code> (future time) are independent of planning</td><td><code>ra'yuh kwemraku'ha uprahay nayla beyanli</code></td></tr>
      <tr><td>Planned obligation</td><td>Combine obligation with PROS on the intended action</td><td><code>ra'yuh kwemraku'ha uprahay'wolug nayla</code></td></tr>
    </tbody>
  </table></div>
  <p>The new predicate suffixes preserve every letter of the stem. Only hypothetical <code>'tcha</code> uses the special final-letter deletion rule. The apostrophe is a romanisation boundary and not a glyph. Suffix stacking on the same predicate remains unspecified.</p>
  <p>Three new <em>proposed</em> compounds support a fuller example: <code>gralemih</code> (know), <code>tshainsle</code> (imagine), and independent <code>inayng</code> (therefore). In a causal clause, the resultative suffix can replace the standalone connective.</p>
  <p><a href="{{ '/assets/marain/marain-grammar-extension.md' | relative_url }}">Full v0.3 rules and provenance</a></p>
</details>


<details class="dictionary-panel marain-rules">
  <summary>Proposed poetic register v0.4 — rhyme, cadence, and Gaelic-inspired mutation</summary>
  <p>Optional community extensions for verse, <strong>not recovered Marain or Banks canon</strong>. Ordinary prose, nominal cases, and predicate meanings remain unchanged.</p>
  <div class="marain-table-scroll"><table>
    <thead><tr><th>Canonical</th><th>Poetic alternative</th><th>Meaning</th></tr></thead>
    <tbody>
      <tr><td><code>uprahay'wolug</code></td><td><code>uprahay'woluga</code> / <code>uprahay'wolugi</code></td><td>Prospective action; the new vowels only provide cadence</td></tr>
      <tr><td><code>kabo'inayng</code></td><td><code>kabo'inaynga</code> / <code>kabo'inayngi</code></td><td>Resultative, no change of tense or causality</td></tr>
      <tr><td><code>po pren</code></td><td><code>po fren</code></td><td>“Small spaceship” with an optional mutated onset</td></tr>
    </tbody>
  </table></div>
  <p>In the poetic register only, <code>po</code> (“small”) can trigger the initial changes <code>p→f</code>, <code>b→v</code>, <code>t→th</code>, <code>s→sh</code>, and <code>k→ch</code>. The original headword is preserved, mutation must not collide with an existing dictionary word, and unmutation requires its trigger. The source of inspiration is Scottish Gaelic lenition, not its full phonological system.</p>
  <p>Cadence forms are reversible variants of <code>'wolug</code> and <code>'inayng</code>. Hypothetical <code>'tcha</code> keeps its existing final-letter deletion rule. Rhyme, alliteration, refrains, and multi-meaning words remain stylistic choices. The automatic phrase translator does not silently poeticize prose.</p>
  <p><a href="{{ '/assets/marain/poetic-register.md' | relative_url }}">Rules and provenance</a> · <a href="{{ '/marain-poetry-and-ship-names/' | relative_url }}">Poetry and Culture ship-name post</a></p>
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

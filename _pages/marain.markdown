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
<script src="{{ '/assets/marain/js/poetic-ui.js' | relative_url }}" defer></script>
<script src="{{ '/assets/marain/js/marain-tabs.js' | relative_url }}" defer></script>
<script src="{{ '/assets/marain/js/culture-orbitals-ui.js' | relative_url }}" defer></script>
<script type="module" src="{{ '/assets/marain/js/culture-name-ui.mjs' | relative_url }}"></script>

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
  <p><a href="{{ '/assets/marain/poetic-register.md' | relative_url }}">Rules and provenance</a></p>
</details>


<section id="poetry-workbench" class="dictionary-panel" aria-labelledby="poetry-heading">
  <h2 id="poetry-heading">Poetic forms</h2>
  <p>The poetic register is optional. Enter one existing Marain dictionary word in romanization (not a sentence). Choose a rhyme cadence or the Gaelic-inspired mutation after <code>po</code>. The ordinary grammar stays unchanged.</p>
  <label for="poetic-stem">Dictionary headword (romanized)</label>
  <input id="poetic-stem" type="text" value="uprahay" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-describedby="poetic-status">
  <label for="poetic-kind">Poetic transformation</label>
  <select id="poetic-kind" aria-describedby="poetic-status">
    <option value="prospective:a">Prospective, cadence -a</option>
    <option value="prospective:i">Prospective, cadence -i</option>
    <option value="resultative:a">Resultative, cadence -a</option>
    <option value="resultative:i">Resultative, cadence -i</option>
    <option value="mutation">Poetic consonant mutation after po</option>
  </select>
  <p id="poetic-status" class="translation-notes" role="status" aria-live="polite"></p>
  <h3>Romanized poetic form</h3>
  <div id="poetic-output-roman" class="roman-output" aria-live="polite"></div>
  <h3>Marain glyphs</h3>
  <div id="poetic-output-glyphs" class="marain marain-output" aria-label="Poetic Marain glyphs"></div>
  <p class="translation-notes">Try <code>pren</code> with the mutation option to produce <code>po fren</code>. The tool refuses forms it cannot resolve uniquely to known vocabulary. All forms here are newly proposed, not recovered Marain.</p>
</section>

<section id="culture-names" class="dictionary-panel" aria-labelledby="culture-names-heading"
         data-corpus-url="{{ '/assets/marain/culture-names.txt' | relative_url }}">
  <h2 id="culture-names-heading">Culture-universe name generator</h2>
  <p>Invent names resembling the non-ship names in Iain M. Banks's Culture universe. The generator learns letter transitions from the supplied reference list and assembles single, compound, personal, place-like, and institutional names. Generated names are <strong>new inventions, not canonical names or Marain translations</strong>.</p>

  <div class="culture-name-controls">
    <div>
      <label for="culture-name-style">Name structure</label>
      <select id="culture-name-style">
        <option value="mixed">Mixed (source-inspired)</option>
        <option value="single">Single name</option>
        <option value="personal">Personal (multiple parts)</option>
        <option value="hyphenated">Hyphenated / apostrophe</option>
        <option value="place">World or place</option>
        <option value="institution">Organization or faction</option>
        <option value="elaborate">Elaborate personal name</option>
      </select>
    </div>
    <div>
      <label for="culture-name-count">How many</label>
      <select id="culture-name-count">
        <option value="5">5</option>
        <option value="10" selected>10</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </select>
    </div>
    <div>
      <label for="culture-name-seed">Seed (repeatable results)</label>
      <input id="culture-name-seed" type="text" maxlength="120" autocomplete="off"
             spellcheck="false" placeholder="Random seed if empty">
    </div>
  </div>
  <div class="marain-examples">
    <button type="button" id="culture-name-generate" disabled>Generate names</button>
    <button type="button" id="culture-name-shuffle" disabled>New seed</button>
    <button type="button" id="culture-name-copy" disabled>Copy names</button>
  </div>
  <p class="translation-notes">Use the same seed and structure to reproduce a list. “New seed” creates a fresh batch. All generation runs in your browser; it does not send input to a server.</p>
  <p id="culture-name-status" class="translation-notes" role="status" aria-live="polite">Loading name corpus…</p>
  <ol id="culture-name-results" class="culture-name-results" aria-label="Generated, noncanonical names"></ol>

  <details class="marain-interpretation" id="culture-name-source">
    <summary>Browse source names (user-supplied reference corpus)</summary>
    <p>The original, unmodified list contains 784 entries, including people, places, factions, and other names. Names are preserved exactly as supplied; individual entries have not been independently fact-checked against the novels. <a href="{{ '/assets/marain/culture-names.txt' | relative_url }}">View or save the complete plain-text list</a>.</p>
    <label for="culture-name-search">Search original names</label>
    <input id="culture-name-search" type="search" autocomplete="off"
           spellcheck="false" placeholder="e.g. Gurgeh, Gzilt, Culture" disabled>
    <p id="culture-source-status" class="translation-notes" aria-live="polite">Loading source names…</p>
    <ol id="culture-source-results" class="culture-source-results" aria-label="Original reference names"></ol>
    <div class="marain-examples">
      <button type="button" id="culture-source-prev" disabled>Previous</button>
      <button type="button" id="culture-source-next" disabled>Next</button>
    </div>
  </details>
  <noscript><p>Enable JavaScript to generate or search names. The complete reference corpus remains available from the plain-text link above.</p></noscript>
</section>


<section id="culture-orbitals" class="dictionary-panel" aria-labelledby="culture-orbitals-heading"
         data-orbital-data-url="{{ '/assets/marain/culture-orbital-data.json' | relative_url }}">
  <h2 id="culture-orbitals-heading">Culture Orbitals &amp; habitats</h2>
  <p>Named Orbitals and habitats, kept apart from personal names and generated inventions. The first list is <strong>the user-supplied confirmed-name set</strong>, not automatically inferred from birthplace suffixes. The origin clues below are separate research notes, <strong>not additional confirmed Orbitals</strong>.</p>

  <div class="culture-orbital-summary" aria-label="Reference list counts">
    <p><strong>18</strong> standalone names</p>
    <p><strong>1</strong> additional habitat label (Broatsa / Broat)</p>
    <p><strong>16</strong> origin examples, including exceptions</p>
  </div>
  <p class="translation-notes">The accompanying note calls an earlier list “17-name,” but the list supplied here contains 18 standalone names plus “Broatsa (Phage Rock).” All 19 source lines have been retained rather than silently discarding an entry.</p>

  <label for="culture-orbitals-search">Search Orbitals, habitats, and origin components</label>
  <input type="search" id="culture-orbitals-search" autocomplete="off" spellcheck="false"
         placeholder="e.g. Stafl, Juboal, Gevant, Tursen">
  <p id="culture-orbital-search-count" class="translation-notes" aria-live="polite"></p>

  <h3>Source-listed Orbitals and habitats</h3>
  <ul class="culture-orbital-list" id="culture-orbital-confirmed">
    <li data-orbital-name="Codure">Codure</li>
    <li data-orbital-name="Chiark">Chiark</li>
    <li data-orbital-name="Cloathel">Cloathel</li>
    <li data-orbital-name="Dibaldipen">Dibaldipen</li>
    <li data-orbital-name="Dinyol-hei">Dinyol-hei</li>
    <li data-orbital-name="Erbil">Erbil</li>
    <li data-orbital-name="Foerlinteul">Foerlinteul</li>
    <li data-orbital-name="Gadampth">Gadampth</li>
    <li data-orbital-name="Hursklip">Hursklip</li>
    <li data-orbital-name="Masaq’">Masaq’</li>
    <li data-orbital-name="Quyeela">Quyeela</li>
    <li data-orbital-name="Screce">Screce</li>
    <li data-orbital-name="Seddun">Seddun</li>
    <li data-orbital-name="Spanshacht-Trouferre">Spanshacht-Trouferre</li>
    <li data-orbital-name="Stafl">Stafl</li>
    <li data-orbital-name="Svanrayt">Svanrayt</li>
    <li data-orbital-name="Teriocre">Teriocre</li>
    <li data-orbital-name="Yinang">Yinang</li>
    <li data-orbital-name="Broat">Broat <span class="translation-notes">(Phage Rock; source form <code>Broatsa</code>; Kwins system)</span></li>
  </ul>
  <p class="translation-notes">Plain-text source: <a href="{{ '/assets/marain/culture-orbital-names.txt' | relative_url }}">the complete Orbital/habitat name list</a>. The original spelling <code>Broatsa (Phage Rock)</code> is preserved in that file; <code>Broat</code> is displayed here as the habitat's formal name according to the supplied interpretation.</p>

  <h3>Reading Culture personal-name origins</h3>
  <p>The usual two-component origin identifies a larger location and a more specific location. The first part <em>can</em> identify a stellar system or an Orbital; the second may identify a Plate or another subdivision. <code>-sa</code> is a <strong>suffix</strong> on the origin component, roughly equivalent to English <em>-er</em>—not a prefix, and not proof that either part is itself an Orbital. Iain M. Banks gives the explicit example <code>Juboal-Rabaroansa</code>: Juboal is a stellar system, Rabaroan is a Plate; the Orbital's own name is not specified by that example. <a href="https://theculture.adactio.com/">Author's original explanation, “A Few Notes on the Culture”</a>.</p>

  <details id="culture-origin-clues" class="marain-interpretation" open>
    <summary>Additional birthplace and origin clues — not confirmed additions</summary>
    <p>Sixteen examples from the supplied research notes. “Identified” means the supplied evidence identifies the components' types; the book line pointers and most classifications have not been independently checked against the novels. Unresolved candidates remain unresolved.</p>
    <label for="culture-orbital-status-filter">Filter origin clues</label>
    <select id="culture-orbital-status-filter">
      <option value="all">All categories</option>
      <option value="identified">Identified system / Orbital / Plate</option>
      <option value="partial">Partly identified</option>
      <option value="unresolved">Undetermined components</option>
      <option value="speculative">Speculative habitat interpretation</option>
      <option value="variant">Alternate component order (Gzilt)</option>
      <option value="exception">Exceptions (not Orbital evidence)</option>
    </select>
    <div class="marain-table-scroll">
      <table class="culture-origin-table">
        <thead>
          <tr>
            <th scope="col">Source form and person</th>
            <th scope="col">First component</th>
            <th scope="col">Second component</th>
            <th scope="col">Evidence status</th>
          </tr>
        </thead>
        <tbody id="culture-orbital-origin-rows">
          <tr><td colspan="4">Loading annotated origin clues… <a href="{{ '/assets/marain/culture-orbital-data.json' | relative_url }}">Read the reference data</a>.</td></tr>
        </tbody>
      </table>
    </div>
    <p id="culture-orbital-origin-count" class="translation-notes" aria-live="polite"></p>
  </details>

  <details class="marain-interpretation">
    <summary>Exceptions and evidence rules</summary>
    <p><strong>Tursensa Ngaroe</strong> is an explicitly retained Gzilt ordering variation and should not be rewritten to match a Culture-default pattern. <strong>Parharengyi</strong> being an asteroid-built interstellar habitat is a hypothesis, not an established identification. <strong>Ulver Seich</strong> was born outside the Culture (Sursamen Shellworld, eighth level). <strong>Quyn-Sichultsa</strong> refers to a star system and planet in a subsequently adopted Culture name, not an Orbital.</p>
    <p>Ship and drone names are excluded. <strong>Klatsli Quike's Astle-Chulinisa</strong> is excluded as birthplace evidence because Quike is a ship avatar. The presence of an origin-like suffix alone does not establish the nature of any location.</p>
    <p>Structured source data: <a href="{{ '/assets/marain/culture-orbital-data.json' | relative_url }}">JSON reference and origin clues</a>. Source locations in the notes are edition-dependent line numbers.</p>
  </details>
  <noscript><p>JavaScript is required to display the filtered origin-clue table. The confirmed-name list and linked JSON remain available without it.</p></noscript>
</section>


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

# Marain grammar extension v0.4 — hypothetical, patientive, resultative, prospective, and poetic register

**Status: adopted into this project's dictionary as explicitly proposed language (2026-10-21).** Neither the new irrealis suffix nor zero-marked predicate chaining is asserted to be part of Iain M. Banks's published Marain. The original community-lesson evidence is preserved in the [lesson-rule audit]({{ '/lesson-rules/' | relative_url }}).

## Recovered features retained

- Seven existing nominal cases (nominative, accusative, dative, originative, locative, comitative, bare vocative/absolutive) and four grammatical persons; nouns and pronouns continue to take their ordinary case endings.
- Predicates have no obligatory tense or person inflections in the surviving material. Existing optional time locatives include `bechumli` (past), `ikili` (present), and `beyanli` (future).
- `hanggra` is the Lesson 16 yes/no question marker. `shay` is used for who/what/which.
- `hech` (no/not/without) is attested after a verb, but the generalized scoping rule below is **proposed**.
- `tcha` (if), `ayng` (then), `heth` (believe), `tsha` (think about), `uprahay` (go/move), and `nayla` (away) are existing dictionary words.

## 1. Zero-marked predicates and optional `ke`

**Proposal (superseding v0.1's mandatory `ke`):**

`[subject.NOM] [modal or control predicate] (hech) [main predicate] (hech) [case-marked arguments]`

A modal (ability, permission, advice, obligation) or control predicate (desire, need, intention) takes the following verb phrase as its complement *without requiring another particle*. The complement inherits the matrix subject when no new nominative is given. An explicit second nominative introduces a different subordinate actor:

- `ra'yuh okehi uprahay nayla.` — I want to leave (literally I want to go away).
- `ra'yuh funuft uprahay nayla.` — I can leave.
- `ra'yuh shuhztnuft uprahay nayla.` — I should leave.
- `ra'yuh okehi geyuh uprahay nayla.` — I want you to leave.

The existing proposed `ke` remains available *optionally* before the subordinate predicate where a boundary would otherwise be ambiguous. It is no longer the default equivalent of English “to”. These are **new syntax rules**, not observed lesson constructions.

The default display order of linked predicates is significant even though ordinary noun roles are marked by case. More complex nested clauses and freedom of argument order inside chains remain experimental.

## 2. Hypothetical / irrealis predicate suffix `'tcha`

**Proposal:** attach `'tcha` directly to the predicate whose action, capacity, or desire is hypothetical rather than asserted as actual.

### Orthographic rule (revised Marain romanisation)

Before appending `'tcha`, delete **one** final ending from the original predicate, checking the two-letter ending `ch` first, then `c`, `p`, `d`, `t`, or `y`. For any other ending, retain the complete stem. The rule is applied **once** per suffixation, not repeatedly to newly exposed letters.

| Ending | Treatment | Example |
|---|---|---|
| `ch` | Drop `ch` | `hech → he'tcha` (illustrates spelling only; `hech` is not a predicate) |
| `c` | Drop `c` | No dictionary predicate currently ends in Roman `c`; retained for future vocabulary |
| `p` / `d` | Drop final letter | Rule defined; examples depend on eligible predicate stems |
| `t` | Drop `t` | `funuft → funuf'tcha`, `nocht → noch'tcha` |
| `y` | Drop `y` | `uprahay → upraha'tcha` |
| Other | Keep stem | `okehi → okehi'tcha`, `heth → heth'tcha` |

The apostrophe is the standard romanised *boundary notation*, not an additional Marain glyph or spoken syllable. Because `ay` represents a glyph in revised romanisation, dropping final `y` in `uprahay` can change the underlying glyph sequence: `uprahay` is internally `OprahA`, while `upraha'tcha` is `OprahaCa`. The converter performs the transformation on romanised stems, then re-encodes the resulting glyph keys. This is intentional and should not be silently “corrected” to ordinary text concatenation.

The new predicate suffix is distinct from **standalone** `tcha` (“if”) and the previously proposed compound `hangtcha` (“counterfactual if”). Do not create a conflicting headword for the suffix.

### Mood and scope examples

| English | Proposed Marain |
|---|---|
| I leave | `ra'yuh uprahay nayla.` |
| I would leave | `ra'yuh upraha'tcha nayla.` |
| I can leave | `ra'yuh funuft uprahay nayla.` |
| I could leave | `ra'yuh funuf'tcha uprahay nayla.` |
| I want to leave | `ra'yuh okehi uprahay nayla.` |
| I would like to leave | `ra'yuh okehi'tcha uprahay nayla.` |
| I want to leave in hypothetical circumstances | `ra'yuh okehi upraha'tcha nayla.` |

When `'tcha` marks `okehi`, the expression can conventionally **soften a request or desire** (“would like”). Hypothetical mood does not automatically mean politeness elsewhere.

## 3. Negation scope in predicate chains

**New generalization:** place `hech` directly after the predicate that is negated.

- `ra'yuh ku'ha hech uprahay nayla.` — I do not need to leave.
- `ra'yuh kwemraku'ha uprahay hech nayla.` — I must not leave.
- `ra'yuh funuft hech uprahay nayla.` — I cannot leave.

The distinction between negating the controlling predicate and negating the embedded action is part of the extension, not fully documented in the lessons.

## 4. Opinion predicates governing propositions

Use **`heth`**, “believe,” for English *I think [proposition]*; **`tsha`** means *think about/consider* an object.

Under the proposed rule, a second nominative following a belief predicate starts the proposition the speaker believes:

- `ra'yuh heth geyuh shuhztnuft uprahay nayla.` — I think you should leave.
- `ra'yuh heth'tcha geyuh shuhztnuft uprahay nayla.` — I would think you should leave.

The hypothetically qualified **belief** is not the same as hypothetically qualified **departure**. Do not add an English “that” equivalent unless needed for clarity. This construction is intentionally narrower than general unrestricted embedding.

## 5. Lexicon provenance and unresolved distinctions

The prior v0.1 entries remain marked `proposed-extension`: `ke` (now optional), `funuft` (ability), `gihwinuft` (permission), `shuhztnuft` (advisability), `kwemraku'ha` (binding obligation), `wolugnuft` (intention), and `hangtcha` (counterfactual conditional). `anong` gains a proposed clause-wide possibility interpretation. Existing roots `okehi`, `ku'ha`, `heth`, and `tsha` are retained.

General if/then clauses, perfect/progressive aspect, polyclausal negation, unrestricted fronting, and fine-grained politeness remain open questions. The phrase assistant demonstrates only covered patterns and preserves unknown phrases as `<??>`, without claiming all nested clauses are solved.

**Validation:** run `node --test tests/marain-phrases.test.cjs`. The grammar is proposed; the tests check implementation consistency, not historical authenticity.

## 6. Extension v0.3: patientive, resultative, and prospective

**Status: adopted for the project as a community proposal on 2026-10-21, not recovered Banks or community-lesson canon.** All rules in sections 1–5 above remain unless explicitly superseded here. The seven nominal cases from the original lessons are unchanged. This extension adds an eighth nominal case and two distinct predicate markers.

### Patientive (PAT): nominal case `-vuh`

Add the case-sensitive internal suffix `vu` (romanised `vuh`) to a noun or pronoun normally capable of serving as an affected argument. The patientive-marked argument is the **grammatical subject undergoing the event**, with the actor absent or unspecified. The verb remains in its ordinary form. **Do not mark the patientive argument accusative as well**. This passive-like construction is only proposed for verbs with identifiable undergoers.

| Active and patientive | Meaning |
|---|---|
| `ra'yuh tova tshainsle bechumli.` | I imagined it in the past (active; `to-va` is the object) |
| `tovuh tshainsle bechumli.` | It was imagined (patientive; actor unspecified) |
| `tovuh tshainsle.` | It is imagined (no obligatory tense marker) |
| `tovuh tshainsle beyanli.` | It will be imagined (future temporal locative) |

For `to` “it,” nominative is `toyuh`, accusative `tova`, patientive `tovuh`. Other stems form patientive mechanically, for example `pren → prenvuh`. An explicit agent phrase is not yet standardized; do not silently reinterpret originative `-sa` as an agent case.

### Resultative (RES): predicate suffix `'inayng`

Mark the **predicate of a consequent proposition** with `'inayng` (internal suffix `EnAG`, from `in` “because” and `ayng` “then”). The preceding clause supplies the cause or logical premise. The consequence is asserted by the speaker; the marker does not prove causality or temporal sequence and **does not mean completed action**.

`[cause clause], [patient/actor] [consequent predicate]'inayng [arguments/time].`

Example: `ra'yuh okehi'tcha gralemih, tovuh tshainsle'inayng bechumli.` — “I would like to know; therefore it was imagined.”

Here `bechumli` alone supplies past time. The alternative independent connective `inayng` can precede a consequent clause, but do not require both the connective and resultative suffix at once. The idiom makes a causal assertion; whether the assertion is sensible is a question of meaning, not morphology.

### Prospective (PROS): predicate suffix `'wolug`

Attach `'wolug` (internal suffix `wolOg`, based on `wolug` “a plan”) to an action that is planned, scheduled, or intended **but is not yet realized relative to its reference time**. It does not entail that the action will happen or that anyone is obliged to perform it. The future locative `beyanli` is an independent temporal expression; a plan may also be described from a past reference point.

| Marain | Interpretation |
|---|---|
| `ra'yuh uprahay'wolug nayla.` | I plan to leave |
| `ra'yuh kwemraku'ha uprahay nayla beyanli.` | I must leave in the future (obligation + future time, no implication of a plan) |
| `ra'yuh kwemraku'ha uprahay'wolug nayla.` | I am scheduled and obliged to leave (obligation + plan) |
| `ra'yuh upraha'tcha nayla.` | I would leave, conditional/hypothetical, **not** a stated plan |

`kwemraku'ha` is the already-proposed obligation predicate. The added prospective marker scopes over the **planned event** (e.g. `uprahay`), not the necessity itself. A plan and obligation are two independently asserted properties.

### Suffix spelling and stacking

| Marker | Applies to | Morphophonology |
|---|---|---|
| `-vuh` | nominal argument | ordinary case suffix; no apostrophe required |
| `'tcha` | predicate | existing v0.2 truncation: delete one final `ch`, `c`, `p`, `d`, `t`, or `y` first |
| `'inayng` | predicate of consequence | preserve full stem |
| `'wolug` | predicate of planned action | preserve full stem |

The apostrophe indicates an orthographic morpheme boundary, not an additional native Marain glyph. Thus `uprahay'wolug` displays with key `OprahAwolOg`, whereas `upraha'tcha` has key `OprahaCa`. Attaching multiple predicate suffixes to **the same predicate**, their order, and scope are deliberately left unresolved. A sentence may have different markers on different predicates, and a modal predicate may govern a prospective-marked event.

### Proposed vocabulary supporting the example

These are **new lexical proposals**, not restored sources, each recorded in `dict.js` with `status: proposed-extension` and its derivation:

| Romanised | Internal key | Derivation / meaning |
|---|---|---|
| `gralemih` | `gralemi` | `gra` (true) + `lemih` (sense) → know |
| `tshainsle` | `tSaEnsle` | `tsha` (consider) + `insle` (make) → imagine |
| `inayng` | `EnAG` | `in` (because) + `ayng` (then) → therefore; independent connective distinct from attached `'inayng` |

### Implementation and limits

The phrase assistant supports a restricted set of English paraphrases for this extension (including “it was imagined,” “I plan to leave,” “I am scheduled and obliged to leave,” and the explicit comma + therefore example). It does not claim general passive, causative, modal-embedding, or aspect parsing; unsupported constructions remain partial. Tests check orthographic boundaries, patientive versus accusative, prospective versus necessity, resultative scope, and no regression in recovered examples.


## 7. Poetic register v0.4 — rhyme without changing ordinary grammar

**Community proposal (2026-10-21), not recovered Banks or lesson canon.** The existing case endings and predicate meanings remain unchanged. Poetry can use refrains, consonant correspondence, internal rhyme, and double-meaning words without requiring new grammar.

### Optional prosodic conjugations

The two v0.3 predicate suffixes **prospective** `'wolug` and **resultative** `'inayng` optionally take -a (glyph `a`) or -i (glyph `E`) in the poetic register. These are sound variants of the same predicate meaning, **not new tense/aspect/case values**. The ordinary form remains valid in verse and prose.

| Predicate | Ordinary | Poetic ending a | Poetic ending i |
|---|---|---|---|
| `uprahay` (go) | `uprahay'wolug` | `uprahay'woluga` | `uprahay'wolugi` |
| `kabo` (speak) | `kabo'inayng` | `kabo'inaynga` | `kabo'inayngi` |

The surface glyph keys are `OprahAwolOga`, `OprahAwolOgE`, `kaboEnAGa`, and `kaboEnAGE`. The apostrophe is only a romanized morpheme boundary, not a glyph. These forms reverse to their existing stem + suffix without semantic loss. Do not conflate the prospective marker with necessity or the resultative with completed action.

Hypothetical `'tcha` **does not** acquire cadence endings under v0.4; its one-time deletion before `ch`, `c`, `p`, `d`, `t` or `y` remains unchanged. The order of stacked predicate suffixes is not yet defined.

### Gaelic-inspired initial consonant mutation

A narrowly scoped *optional poetic register* mutation may follow the existing adjective `po` (“small”). It applies to ordinary known dictionary headwords and changes their initial Marain glyph as follows: `p→f`, `b→v`, `t→T` (th), `s→S` (sh), `k→H` (ch). For example, `po pren` may be `po fren`, both intended to mean “small spaceship.”

This **does not reproduce Gaelic lenition**; it borrows the idea that a preceding word can trigger a predictable initial-consonant change. Normal prose remains `po pren`. The helper requires an explicit trigger, refuses a mutated form that would collide with an existing dictionary entry, and reverses only to a unique dictionary lemma in its trigger context. The mutated form is not inserted as a separate headword. The dictionary's ordinary case and person rules are unaffected.

### Poetic composition

Gaelic *aicill*, Welsh *cynghanedd*, Persian ghazal rhyme and refrain, Arabic *sajʿ*, and Japanese pivot words are inspirations for rhythmic and semantic play. These are **not** asserted to be historical Marain rules. `gra` (true/correct) might be repeated as an optional refrain. `luh` (flow, current, wind) already has a useful semantic pivot. Ordinary word order remains constrained by the v0.2/v0.3 parser in automated translations even though case can license alternate emphasis in manual verse.

### Borrowings and translation provenance

Five proposed headwords are recorded with `status: proposed-extension`: `lemihgra` (test/verify, sense+true); `gaflemih` (read, word+sense); `saynowetsiki` (still/continuing, exist+after); `hechrayspatsmaychrayti` (roughly non-war/non-military, **not a fully equivalent word for civilian**); `burach` (mess/shambles, adapted from Scottish Gaelic `bùrach`).

The Gaelic-derived `burach` is **not** proof of an established translation for “That's heavy messing.” The proposed Gaelic phrase `’S e trom-bhùrach a th’ ann gu dearbh` has an interpretable structure but should not be treated as an authenticated idiom. *Heavy messing* can refer to serious interference, not merely disorder.

Culture ship-name translations are interpretive glosses; *Just Testing* and *Just Read the Instructions* still omit the nuance of *just*, and several names lose wordplay or tense distinctions. See [detailed poetic-register rules]({{ '/assets/marain/poetic-register.md' | relative_url }}).

Implementation: the translator exposes bounded opt-in `poeticCadence`, `reversePoeticCadence`, `poeticMutate`, and `reversePoeticMutation` helpers, with collision checks and tests. It does not automatically mutate ordinary English-to-Marain outputs.

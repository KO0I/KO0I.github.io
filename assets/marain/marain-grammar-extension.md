# Marain grammar extension v0.2 — hypothetical predicates and clause chaining

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

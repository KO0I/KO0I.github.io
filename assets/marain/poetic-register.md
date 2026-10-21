# Marain poetic register v0.4

**Community language extension — not recovered Banks canon.** Ordinary forms remain valid and primary. The poetic register offers opt-in prosodic and sound changes that do not modify existing case, person, or predicate meaning.

For context see [the v0.4 grammar]({{ '/assets/marain/marain-grammar-extension.md' | relative_url }}) and the [poetry and Culture ship-name post]({{ '/marain-poetry-and-ship-names/' | relative_url }}).

## Prospective/resultative cadence

| Meaning | Canonical | Cadence a | Cadence i |
|---|---|---|---|
| Prospective, planned action | `uprahay'wolug` | `uprahay'woluga` | `uprahay'wolugi` |
| Resultative, consequent event | `kabo'inayng` | `kabo'inaynga` | `kabo'inayngi` |

Final *a* has glyph key `a` and final *i* key `E`. The apostrophe represents a morph boundary in the romanization, not a native glyph. The ordinary rules for `'wolug` and `'inayng` stay in force: the stem is preserved. These variants reverse to their ordinary predicate stem and grammatical suffix; the endings have no independent aspect or modal interpretation. Hypothetical `'tcha` remains unaffected, and suffix stacking is not defined.

## Gaelic-inspired initial consonant change (opt-in)

After the existing adjective `po` (“small”), a known noun lemma may change its first glyph in the poetic register:

| Original | Contextual poetic form | Initial glyph shift |
|---|---|---|
| `po pren` | `po fren` | `p → f` |
| `po bin` | `po vin` | `b → v` |
| `po tasi` | `po thasi` | `t → T` |
| `po sewuk` | `po shewuk` | `s → S` |
| `po kotuk` | `po chotuk` | `k → H` |

The mapping borrows *an idea* from [Scottish Gaelic lenition](https://learngaelic.scot/grammar_hacks/lenition.jsp); it does not reproduce Gaelic grammar, pronunciation, or spelling. Generated forms are contextual surface changes, not new dictionary entries. The helper requires the `po` trigger, rejects ambiguous collisions with existing Marain words, and can reverse only to a known original lemma. Ordinary English-to-Marain translation never silently changes a word's first consonant.

## Rhythmic and semantic conventions

Internal rhymes inspired by Gaelic *aicill*, consonant echoes inspired by Welsh *cynghanedd*, rhyme-plus-refrain in Persian ghazals, Arabic rhymed prose, and pivot words inspired by Japanese *kakekotoba* are poetic options, not grammatical rules.

Existing `gra` means true/correct and can be *proposed* as a repeated affirmation in verse. `luh` means flow, current, and wind, a potential pivot without inventing new vocabulary.

## Proposed dictionary vocabulary

| Romanization | Internal glyph key | Meaning and derivation |
|---|---|---|
| `lemihgra` | `lemigra` | test/verify; `lemi` sense + `gra` true (reverse of proposed `gralemih`) |
| `gaflemih` | `gaflemi` | read; `gaf` word + `lemi` sense |
| `saynowetsiki` | `sAnowetsEkE` | still/continuing; `sAno` exist + `wetsEkE` after |
| `hechrayspatsmaychrayti` | `heHrAspatsmAHrAtE` | non-war/non-military; a rough approximation, not interchangeable with *civilian* |
| `burach` | `bOraH` | mess/shambles; adapted borrowing from Gaelic *bùrach* |

Each new headword is marked `proposed-extension` with provenance. *Heavy messing* can mean large-scale interference, not just a disordered situation; `hegayret burach` (“serious mess”) must not be passed off as a verified Banks phrase.

## Translator/API behavior

`poeticCadence(stem, kind, cadence)` and `reversePoeticCadence(form)` provide reversible, meaning-preserving forms for selected suffixes. `poeticMutate(po, lemma)` and `reversePoeticMutation(po, form)` implement the narrow initial consonant change. Invalid forms or missing context return no mutation. No default prose translation is changed.

Validation: `node --test tests/marain-phrases.test.cjs` checks dictionary round-trips, canonical and poetic forms, context and collision rules. Poetic additions are proposals even if the code passes its tests.

---
layout: page
title: Marain Lesson Rules
permalink: /lesson-rules/
image: 'images/521.jpg'
---

# Grammar recovered from the Marain community lessons

This document prepares the conlang for further expansion and describes the deliberately limited phrase assistant on `/marain/`. It compares the 15 supplied lesson images with the 430-entry dictionary in `KO0I/KO0I.github.io`, commit `bf89b578997c2466dc54b3dcca723935f2a6bccc`.

The grammar is community material, not a claim that Banks published a complete Marain grammar. Evidence is labelled **explicit** (a stated rule), **attested** (an example), **inferred** (a cautious generalisation), or **unresolved**. New output assembled from rules is labelled a draft even when every word is known.

## 1. Representation and spelling

**Explicit:** Use the revised romanisation in [IMG_2187](/images/marain-lessons/IMG_2187.jpeg): `ah → a`, `oh → o`, `ee → i`, `eh → e`, `je → ye`, `oo → u`. Preserve `uh`, `ih`, and `ay`. Native glyph keys remain the case-sensitive internal alphabet already used by `dict.js` and `alpha.js`; they are not ordinary English letters.

Use apostrophes to disambiguate letter boundaries when needed: `ra'yuh`, `ra'ye`, `sein'gaf`, `s'ha`, and `g'nayt`. These separators are not separate sounds. Normalise via glyph keys when comparing dictionary words, not by indiscriminately deleting letters or lowercasing the keys.

**Correction to the initial OCR transcript:** Lesson 16 clearly prints **hanggra**, not `hangra`, when enlarged. Its glyphs are `haGgra` (hang + gra). The dictionary addition and assistant preserve that spelling.

**Unresolved:** The first lesson describes its writing as right-to-left, but the subsequent word tables align with the site's existing left-to-right glyph sequences. Do not reverse strings globally or reinterpret the font encoding from that one sentence.

## 2. Cases and clause roles

**Explicit, Lesson 1 ([IMG_2186](/images/marain-lessons/IMG_2186.jpeg)):**

| Role | Roman suffix | Internal suffix | Example |
| --- | --- | --- | --- |
| Nominative: subject/actor | -uh; -yuh after a vowel | u; yu | pren → prenuh; ra → ra'yuh |
| Accusative: object | -va | va | maraynva |
| Dative: recipient | -vihl | vil | gevihl |
| Originative: source/origin | -sa | sa | raybihnsa |
| Locative: location | -li | lE | prenli |
| Comitative: companion/association | -ye | j | ra'ye |
| Vocative/absolutive | none | none | a bare name or citation form |

The source calls the dative a “direct object,” but its example is “to them.” The assistant follows the example and reserves accusative for the direct object. This discrepancy is documented rather than converted into two competing object rules.

**Explicit:** Case supports flexible word order. **Inferred implementation convention:** use subject–verb–object when generating an ordinary draft. Source examples also put verbs or objects first; the convention is not a new grammatical requirement.

**Attested:** `ra'yuh gore ivemiva dam ge` — I meet your friend. `ra'yuh kabo maraynva` — I speak Marain. Bare verbs occur with English present and past translations. Do not invent English-like person endings, past suffixes, future auxiliaries, or obligatory plural agreement.

**Unresolved:** Coordinated noun phrases, subordinate clauses, voice, predicate complements, and case scope across complex phrases. The first assistant handles a restricted clause, one direct object, and at most one explicit recipient/location/origin/companion phrase. Unsupported structures fall back to lexical matches.

## 3. Pronouns

| Person | Singular | Plural | Evidence |
| --- | --- | --- | --- |
| First | ra | ora | Lesson 1 |
| Second | ge | llay | Lesson 1 |
| Third | to | wuh | Lesson 1 |
| Fourth/impersonal | ong | onge (Lesson 1); ongi (dictionary) | Variant conflict |

English he/she/it map to `to`; the evidence does not require gendered forms. The UI makes its defaults explicit: “you” is singular and “they” plural. “You all” selects `llay`. Singular “they” needs future disambiguation rather than guessing from context.

`onge` and `ongi` encode different final vowels. Record the older form as a source variant; do not count it as an unrelated new meaning or silently replace the current dictionary's `ongi`.

## 4. Possession and noun association

**Explicit, Lesson 21 ([IMG_2198](/images/marain-lessons/IMG_2198.jpeg)):** English “I have a flower” is `yesayn lomra'yuh ra'ye`: literally, a flower exists with me.

Generalisation: `yesayn + thing.NOM + holder.COM`.

- `yaf` means physically hold, not abstract possession.
- `bahllavecht` means hoard, own more than one can use; it is not a neutral translation of “have.”
- Keep these meanings distinct. Do not apply the possession template to English auxiliaries such as “I have eaten.”

**Attested, Lesson 20:** `ivemiva dam ge` — your friend. Noun association uses `noun + dam + possessor`.

**Explicit, Lesson 11:** `da` replaces `dam` before a word starting with the Marain letter named *ma* (the m glyph). The initial transcription's wording could be read as the syllable `ma`; the image identifies the letter, and the current dictionary specifies initial m. The implementation applies this to a following initial m glyph.

## 5. Questions, negation, and modification

**Explicit/attested, Lesson 16:** `hanggra + clause` asks whether the clause is true. Example: `hanggra kabo geyuh maraynva` — Do you speak Marain?

**Attested, Lesson 7:** `yokayshay sayno geyuh` — How are you doing? `shay sein'gafva datsha gevihl` — What is your name?

**Explicit, Lesson 1:** `shay` = who/what/which; `yokay` makes an adjective adverbial. **Attested, Lesson 12:** `yokay ivemi` conveys “like a friend,” so the example permits a nominal base too. Do not declare that every English -ly adverb has a mechanically corresponding Marain form.

**Attested, Lesson 15:** `x lig y` = more y than x. This supports comparative constructions but not an unrestricted superlative or degree system.

**Explicit/attested:** `hech` covers no/not/without. `ra'yuh nadek hech ubiva` is translated “I don't do drugs.” **Unresolved:** a general negation position and scope rule. The assistant knows this attested negative sentence but falls back for new negative clauses instead of moving `hech` around arbitrarily.

**Unresolved:** obligatory adjective position and agreement. The optional adjective + head order in generated simple noun phrases is provisional and visibly labelled in the interpretation notes. English articles are omitted in covered noun phrases, following the examples; this does not assert that definiteness is impossible in the language.

## 6. Derivation and semantic construction

**Explicit, Lesson 7:** verb → noun with `-i` after a consonant and `-wi` after a vowel. Examples: `nadek → nadeki`, `kabo → kabowi`.

**Attested:** Existing dictionary nouns can denote an action, product, or agent (`gafmarawi`, `insleiltsimarawi`, etc.). The productive suffix alone does not settle which sense a new coinage has. A coined derivation needs a gloss and provenance.

**Explicit, position sheet [IMG_2188](/images/marain-lessons/IMG_2188.jpeg):** `o-` turns the listed spatial terms into verbs: `g'nayt → og'nayt`, “around” → “to orbit.” This evidence licenses that family, not arbitrary prefixing to all nouns.

**Explicit, Lesson 1:** `ray-` indicates uniqueness. **Attested:** `bihn → raybihn` (culture → the Culture), `muhrer → raymuhrer` (mind → Mind). Do not translate every English “the” into `ray-`.

**Attested:** Compounds include `guhchetpren` (land vehicle), `choldicheinda` (animal matter/meat), and `sein'gaf` (identity-word/name). **Inferred:** compounding is available for expansion. **Unresolved:** universal head direction, linking vowels, and semantic transparency. Record whole compounds rather than splitting arbitrary words and claiming their meanings are compositional.

**Explicit, Lesson 1:** `pe-X-t` means “seem to X”; `perat` is `pe + ra + t`, not the bare verb *to be*. This prevents subjective impressions from becoming false identity statements.

## 7. Time and number

**Attested, Lesson 12:** `bechumli`, `ikili`, `beyanli` mean in the past, present, future. These are locative forms of time nouns, not demonstrated tense suffixes. The assistant does not fabricate aspect or perfect-tense rules.

**Explicit, [IMG_2189](/images/marain-lessons/IMG_2189.jpeg) and Lesson 18:** numbers are base eight. Digit words are `nhech sto hre dosa llamih ko gol lyeway`. Decimal 8 → `stonhech`; 9 → `stosto`; 10 → `stohre`. Convert the value before writing Marain numeral sequences; don't merely replace decimal digit names.

**Attested:** `dosa dam uprayheva` — three humans (object). Numeral + `dam` precedes the case-marked noun.

**Explicit:** `amnwe` = eight to the power of; mathematical `tswa` = times; `uh` = plus/and. Lesson 18's examples include `amnweko` (8⁵), and `golstoko dam tswa amnwehre uh dosa` (615₈ × 8² + 3). Arbitrary expression parsing is outside the first assistant.

**Unresolved:** the Lesson 18 English heading says “4 or more digits,” while the corresponding glyph line appears to express “more than 3.” Treat this as a likely equivalent threshold formulation, not a new numeral value.

## 8. Vocabulary reconciliation

The comparison is based on the glyph alphabet, not raw romanisation string equality. This avoids counting `g'nayt/gnayt`, `s'ha/sha`, and ordinary case forms as new headwords.

### Eleven added entries (430 → 441)

| Romanisation | Internal key | Meaning | Source |
| --- | --- | --- | --- |
| nayla | nAla | away; opposite direction | [IMG_2188](/images/marain-lessons/IMG_2188.jpeg) position words |
| sein | seEn | identity | [IMG_2190](/images/marain-lessons/IMG_2190.jpeg), Lesson 7 |
| sein'gaf | seEngaf | name | [IMG_2190](/images/marain-lessons/IMG_2190.jpeg), Lesson 7 |
| datsha | datSa | to call; name | [IMG_2190](/images/marain-lessons/IMG_2190.jpeg), Lesson 7 |
| metwuhshay | metwuSA | how many; how much | IMG_2194, Lesson 15 |
| hang | haG | false; incorrect | [IMG_2195](/images/marain-lessons/IMG_2195.jpeg), Lesson 16 |
| gra | gra | true; correct | [IMG_2195](/images/marain-lessons/IMG_2195.jpeg), Lesson 16 |
| hanggra | haGgra | is it true that | [IMG_2195](/images/marain-lessons/IMG_2195.jpeg), Lesson 16 |
| hechkwemrawi | heHkwemrawE | meatfucker; taboo for a ship reading minds without permission | [IMG_2195](/images/marain-lessons/IMG_2195.jpeg), Lesson 16 |
| choldicheinda | HoldEHeEnda | meat; animal matter | [IMG_2195](/images/marain-lessons/IMG_2195.jpeg), Lesson 16 |
| kra | kra | all | [IMG_2197](/images/marain-lessons/IMG_2197.jpeg), Lesson 20 gloss |

Each added entry records its source and community-lesson status in `dict.js`. No unattested vocabulary is coined in this change. `ray-`, case suffixes, and productive number sequences are documented rules, not duplicate lexical entries. Proper names in examples are not promoted to generic vocabulary.

### Existing definitions reconciled

| Entry | Change | Evidence |
| --- | --- | --- |
| yaf | Remove neutral “to have”; retain physical holding | Lesson 21 explicitly distinguishes them |
| insleiltsimarawi | Include work as well as worker | Lesson 20 table and example |
| dafihnye | Include new as well as young | Lesson 11 |
| heldyet | Include organisation as well as structure/building | Lesson 12 |
| tswa | Record mathematical times as a contextual sense | Lesson 18 |
| muhrer | Include consciousness and software | Lesson 12 |
| muhksih | Preserve dictionary death and explicitly record lesson to die as an unresolved noun/verb difference | [IMG_2193](/images/marain-lessons/IMG_2193.jpeg) handwriting; glyphs support muhksih |

The handwriting spellings `chakllich`, `chaytscha`, and `spetshihch` already match dictionary keys. They do not need duplicate entries. The original handwritten romanisation of “to die” remains uncertain; it must not establish a competing `muksih` headword.

### How to extend:

1. Add an attested lemma with its case-sensitive glyph key, part of speech, exact English aliases, source image/lesson, and status. Prefer clear single senses over substring matches from prose definitions.
2. Distinguish a genuinely absent lemma, a missing sense, a spelling variant, a regular inflection, and a conjectural derivation.
3. Add a sentence rule only with a supported pattern and examples. Test unknown subjects, verbs, objects, number, ambiguity, and scope; do not erase unmatched words to make output look complete.
4. Label new coinages and inferred grammar as proposals. Keep them out of automatic authoritative output until accepted.
5. Future work needs explicit decisions on singular they, tense/aspect, negation scope, adjective agreement, complex clauses, names, and when a noun-derived action/agent sense is intended.


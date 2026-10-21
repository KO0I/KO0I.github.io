# Marain grammar extension v0.1

**Status: adopted into this site's community dictionary as *proposed* language, 2026-10-21.** Proposed grammar is not an assertion about Iain M. Banks's original Marain. Restored lesson vocabulary is explicitly distinguished from these inventions.

**Sources:** recovered Marain community lessons, especially 1, 2, 7, 12, 16 and 21; the site's dictionary and [lesson-rule audit]({{ '/lesson-rules/' | relative_url }}).

## Existing rules retained

- Seven noun cases: nominative, accusative, dative, originative, locative, comitative, and bare vocative/absolutive. Case marks grammatical role, permitting flexible word order.
- First-, second-, third-, and generic fourth-person pronouns, each singular/plural; no new personal agreement is required on verbs.
- Verbs are not obligatorily inflected for tense or person. Optional attested temporal locatives include `bechumli` (past), `ikili` (present), `beyanli` (future). No dedicated aspect system is established here.
- `hanggra` (“is it true that…?”) is **recovered from Lesson 16** for yes/no questions. `shay` supplies who/what/which questions.
- `hech` “no/not/without” and its postverbal use are **attested** in Lesson 2. Its general predicate-local scope below is newly proposed.
- `tcha` (if) and `ayng` (then) already exist; retain their meanings.

## Seven proposed dictionary entries

| Romanisation | Glyph key | Meaning | Formation |
|---|---|---|---|
| `ke` | `ke` | predicate-complement linker (“to…”) | new grammatical particle |
| `funuft` | `fOnOft` | can; ability | `fu` (ability) + `nuft` (do) |
| `gihwinuft` | `giwEnOft` | may; permission | `gihwi` (permission) + `nuft` (do) |
| `shuhztnuft` | `SuztnOft` | should; advisable | `shuhzt` (desirable) + `nuft` (do) |
| `kwemrakuha` | `kwemrakOha` | must; rule-bound | `kwemra` (respect rules) + `kuha` (need) |
| `wolugnuft` | `wolOgnOft` | intend to | `wolug` (plan) + `nuft` (do) |
| `hangtcha` | `haGCa` | contrary-to-fact if | `hang` (false) + `tcha` (if) |

### New grammatical senses of existing words

- `anong` (glyph `anoG`) already means **possibility**. Proposed clause-initial use: *maybe/perhaps/might*.
- `hech` (glyph `heH`) already means **no/not/without**. Proposed placement: directly after whichever predicate is negated.
- `okehi` (want), `kuha` (need), `gih` (allow), `saynomag` (begin), and `nocht` (stop) may use the new `ke` complement rule. Their stems remain existing vocabulary.

## Proposed rules

### Verb complement and reference

`[subject.NOM] [modal or control predicate] (hech) ke [(subordinate subject.NOM)] [verb] (hech) [case-marked arguments]`

The `ke` linker introduces an event or predicate complement. With no explicit subject, it inherits the matrix subject. When a subordinate subject is specified, mark it nominative. Case marking still licenses free argument order, while `ke` remains attached to its introduced predicate. This is a **new rule**, not a reconstructed one.

- `ra'yuh okehi ke kabo maraynva.` — I want to speak Marain.
- `ra'yuh okehi ke geyuh kabo maraynva.` — I want you to speak Marain.
- `ra'yuh funuft ke kabo maraynva.` — I can speak Marain.
- `ra'yuh gihwinuft ke kabo maraynva.` — I have permission to speak Marain.
- `anong ra'yuh kabo maraynva.` — I might speak Marain.
- `ra'yuh shuhztnuft ke kabo maraynva.` — I should speak Marain.
- `ra'yuh kwemrakuha ke kabo maraynva.` — I must speak Marain.
- `ra'yuh wolugnuft ke kabo maraynva.` — I intend to speak Marain.

### Negation scope

Under the **proposed** rule, place `hech` immediately after the predicate whose truth is denied.

| Marain | Meaning |
|---|---|
| `ra'yuh funuft hech ke kabo maraynva.` | I cannot speak Marain (lack ability) |
| `ra'yuh funuft ke kabo hech maraynva.` | I can refrain from speaking Marain |
| `ra'yuh kuha hech ke kabo maraynva.` | I do not need to speak Marain |
| `ra'yuh kwemrakuha ke kabo hech maraynva.` | I must not speak Marain |
| `ra'yuh kwemrakuha hech ke kabo maraynva.` | I am not obliged to speak Marain |

### Question formation

Use recovered `hanggra` before a proposition; do not invent a second question particle or require English-style inversion.

- **Recovered:** `hanggra kabo geyuh maraynva?` — Do you speak Marain?
- **Proposed extension:** `hanggra geyuh okehi ke kabo maraynva?` — Do you want to speak Marain?

Retain `shay` for WH-questions and the existing noun-case marking.

### Conditionals and counterfactuals (proposal, not automated yet)

Attested: `tcha` (if), `ayng` (then). A new compound `hangtcha` may optionally mark an antecedent assumed false.

- `tcha geyuh kabo maraynva, ayng ra'yuh hakla maraynva.` — If you speak Marain, I learn Marain.
- `hangtcha ra'yuh funuft ke kabo maraynva, ayng ra'yuh kabo geyivil.` — If I could speak Marain (but cannot), I would speak to you.

These are analytical equivalents of English *would/could*, **not** tense inflections. The phrase translator currently leaves general conditionals unresolved rather than pretending to translate them reliably.

## Evidence boundaries and future work

The newly proposed `ke`, derived modals, general scope of `hech`, and counterfactual `hangtcha` are **not present in surviving lessons**. They are explicit community language extensions. `hang`, `gra` and `hanggra` were restored previously and remain marked as `community-lesson`. No old dictionary headwords were overwritten. Future decisions: aspect (habitual/progressive/perfect), broader modal constructions, nested scope, gender-neutral singular reference, and conditional compositional semantics.

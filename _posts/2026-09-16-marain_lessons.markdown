---
layout: post
title: "Marain Dictionary & Conlang Extension"
tags: [marain, language, programming]
image: 'images/Animation.gif'
---

# Motivation

One time the original [Marain Dictionary](https://marain-tools.netlify.app/)
went down. I wanted to do my part in preserving that effort, but I also wanted
to post something about 

I've been working on restoring and expanding the [Marain dictionary]({{ '/marain/' | relative_url }}), and wanted to get a bit further than looking up words individually. I want to put a short English phrase in and get back as much Marain as the vocabulary and grammar can support. Anything missing should come back as `<??>`.

# The Lessons

This turns out to require a fair bit of sorting through what is actually known. I have fifteen images of community lessons and notes, now transcribed, which provide enough material to start recovering sentence rules. There are also spelling changes, inconsistencies, and some handwriting that is doing its best to remain mysterious.

The resulting `marain_rules.md` is a working account of those lessons. The community material needs to keep its provenance; these rules should not acquire the authority of something Banks wrote just because they end up in a nice table on my site.

Anyway, there is enough here to do some interesting stuff!

I've included all fifteen recovered scans here, sorry the numbers do not correspond to the entries, not all are online it seems... 
Click any image to open the full-resolution original; the remaining sheets are collected at the end. The scans preserve their original spellings, including older romanisation.

## Cases

Enough about the source material.
The case endings are a useful place to start. They tell us what a noun or pronoun is doing in the sentence:

| Job | Ending |
| --- | --- |
| Subject, the thing doing something | `-uh`, or `-yuh` after a vowel |
| Object, the thing acted upon | `-va` |
| Recipient, who something goes to | `-vihl` |
| Source, where something comes from | `-sa` |
| Location | `-li` |
| Companion or association, “with” | `-ye` |

So the lesson's “I speak Marain” is `ra'yuh kabo maraynva`. The `ra` gets its subject ending, and `marayn` gets its object ending. The apostrophe in `ra'yuh` helps separate the letter boundaries; it does not add a sound.

These endings allow flexibility in word order. For the draft helper, subject–verb–object is a convenient default. The examples do not justify making that order compulsory, or inventing a bunch of verb endings to make everything behave like English.

<figure id="marain-scan-2186" style="margin: 2rem auto; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2186.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2186.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2186.jpeg' | relative_url }}" alt="Recovered Marain Lesson 1, showing case suffixes, pronouns, basic vocabulary, and usage examples." width="1164" height="1516" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 1 — grammar, pronouns, and case endings. <small>IMG_2186.jpeg</small></figcaption>
</figure>

The bit that interests me most is possession. Lesson 21 gives:

> `yesayn lomra'yuh ra'ye`
>
> A flower exists with me.

That is how the lesson expresses “I have a flower.” `yaf` is for physically holding something. Another word, `bahllavecht`, means hoarding, or owning more than one can use.

English “have” does a lot of work, and a careless dictionary lookup could turn a flower being with someone into an assertion about holding or owning it. There is a meaningful difference between something being available to you and accumulating more than you can use. It would be a shame to lose that in the translation machinery.

This also means the program needs to notice what “have” is doing. “I have eaten” cannot be put through the flower template. A small phrase helper still needs to know when to stop.

<figure id="marain-scan-2198" style="margin: 2rem auto; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2198.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2198.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2198.jpeg' | relative_url }}" alt="Recovered Marain Lesson 21, distinguishing physical holding and hoarding from the possession construction there is a flower with me." width="1164" height="708" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 21 — a flower exists with me. Holding, having, and hoarding. <small>IMG_2198.jpeg</small></figcaption>
</figure>

# Vocabulary

Comparing the lessons against the 430-entry dictionary snapshot turned up eleven missing entries, enough to bring the prepared update to 441. These include `sein` for identity, `sein'gaf` for name, and `datsha` for calling or naming. There are also `hang` and `gra`, false and true, and `hanggra`, “is it true that,” for yes/no questions.

`hanggra` has two g's. The initial transcription lost one, which was caught by looking at the enlarged lesson image again. A useful reminder that searchable text can still be wrong.

<figure id="marain-scan-2195" style="margin: 2rem auto; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2195.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2195.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2195.jpeg' | relative_url }}" alt="Recovered Marain Lesson 16, showing hang, gra, hanggra, a yes-or-no question, and additional vocabulary." width="1164" height="1099" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 16 — false, true, and hanggra, with two g’s. <small>IMG_2195.jpeg</small></figcaption>
</figure>

## New Words

There are some useful ways to make new words, too. Lesson 7 gives `-i` after a consonant and `-wi` after a vowel for turning a verb into a noun: `nadek` becomes `nadeki`, and `kabo` becomes `kabowi`. But the ending alone does not tell us whether a newly made noun means an activity, its result, or the person doing it. New vocabulary will still need definitions.

<figure id="marain-scan-2190" style="margin: 2rem auto; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2190.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2190.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2190.jpeg' | relative_url }}" alt="Recovered Marain Lesson 7, covering verb-to-noun endings, greetings, identity, names, and introductions." width="1164" height="2328" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 7 — making nouns, greetings, and introductions. <small>IMG_2190.jpeg</small></figcaption>
</figure>

The position sheet also gives `g'nayt`, around, becoming `og'nayt`, to orbit. That is a particularly nice one to have around for my other projects. The evidence supports applying `o-` to that family of spatial terms; I would want more examples before sticking it on everything.

<figure id="marain-scan-2188" style="margin: 2rem auto; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2188.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2188.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2188.jpeg' | relative_url }}" alt="Marain position-word table, including the o- prefix and the words for around, to orbit, and an Orbital." width="1164" height="1891" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Position words in space and time, including around and to orbit. <small>IMG_2188.jpeg</small></figcaption>
</figure>

And, of course, the numbers need care. These lessons use base eight. Decimal 8 becomes `stonhech`, 9 becomes `stosto`, and 10 becomes `stohre`. Replacing the digits of a decimal number with Marain digit words would quietly change the value. A perfectly avoidable way to get the wrong number of spaceships.

<figure id="marain-scan-2189" style="margin: 2rem auto; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2189.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2189.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2189.jpeg' | relative_url }}" alt="Marain number chart listing digit words from zero to seven, then the base-eight forms for decimal eight, nine, and ten." width="1164" height="1687" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Marain numbers — the digit words and base-eight counting. <small>IMG_2189.jpeg</small></figcaption>
</figure>

The current phrase assistant uses dictionary matches and a small set of these rules, all in the browser. It distinguishes a phrase copied from a lesson, a newly assembled draft, and a partial match. Unknown or ambiguous vocabulary stays visible as `<??>`.

For example, “I eat pizza” can produce `ra'yuh nadek <??>` with the current draft vocabulary. We have enough to do something with “I eat,” and a conspicuous hole where the pizza should be.

The remaining gaps include general rules for negation, tense and aspect, adjective placement, and more complicated clauses. The lessons give examples to work from, but a handful of examples does not settle every possible sentence. I want to keep the difference between a recovered rule and a new proposal easy to see as this grows.

Gonna keep working towards short phrases that can be checked against the lessons, then expand from there. If the little helper runs out of language halfway through a sentence, I want to see where it ran out.

The remaining scans include the alphabet and pronunciation references, more vocabulary, and the handwritten notes. Missing lesson numbers are gaps in this set; I have kept the numbering shown on the originals.

<div class="marain-lesson-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 2rem; align-items: start;">

<figure id="marain-scan-2187" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2187.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2187.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2187.jpeg' | relative_url }}" alt="Marain revised romanisation table alongside letter names, new words, and usage examples." width="1164" height="1161" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Revised romanisation, letter names, and new vocabulary. <small>IMG_2187.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2191" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2191.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2191.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2191.jpeg' | relative_url }}" alt="Recovered Marain Lesson 11, describing the da form of dam and listing vocabulary with an illustrated example." width="1164" height="1228" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 11 — da/dam and more vocabulary. <small>IMG_2191.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2192" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2192.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2192.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2192.jpeg' | relative_url }}" alt="Recovered Marain Lesson 12, with Culture-related vocabulary, past, present, and future words, and example sentences." width="1164" height="2328" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 12 — Culture vocabulary, time words, and example sentences. <small>IMG_2192.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2193" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2193.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2193.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2193.jpeg' | relative_url }}" alt="Handwritten Marain notes headed Basic Curses, including vocabulary and example phrases with partially unclear handwriting." width="1164" height="978" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Handwritten vocabulary and curses; some readings remain uncertain. <small>IMG_2193.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2194" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2194.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2194.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2194.jpeg' | relative_url }}" alt="Recovered Marain Lesson 15, covering how much or how many, comparison, and the distinction between tswa and heron." width="1164" height="1161" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 15 — quantities, comparisons, and two senses of time. <small>IMG_2194.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2196" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2196.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2196.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2196.jpeg' | relative_url }}" alt="Handwritten Marain Lesson 18, showing longer base-eight numbers, powers of eight, multiplication, and addition." width="1164" height="1608" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 18 — longer numbers and powers of eight. <small>IMG_2196.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2197" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2197.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2197.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2197.jpeg' | relative_url }}" alt="Recovered Marain Lesson 20, listing words for meeting, impressions, use, products, and work, followed by usage examples." width="1164" height="1280" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Lesson 20 — meeting, use, work, and example sentences. <small>IMG_2197.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2199" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2199.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2199.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2199.jpeg' | relative_url }}" alt="Marain alphabet chart with native glyphs, older romanisations, IPA pronunciation, and sample words." width="1164" height="1892" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Alphabet, older romanisation, and IPA reference. <small>IMG_2199.jpeg</small></figcaption>
</figure>

<figure id="marain-scan-2200" style="margin: 0; max-width: 760px; width: 100%;">
  <a href="{{ '/images/marain-lessons/IMG_2200.jpeg' | relative_url }}" aria-label="Open full-resolution IMG_2200.jpeg">
    <img src="{{ '/images/marain-lessons/IMG_2200.jpeg' | relative_url }}" alt="Marain vowel chart with native glyphs, romanised spellings, phonetic notation, and English pronunciation examples." width="1164" height="843" loading="lazy" decoding="async" style="display: block; max-width: 100%; height: auto; margin: 0 auto;">
  </a>
  <figcaption style="margin-top: 0.5rem; line-height: 1.5;">Vowel pronunciation reference. <small>IMG_2200.jpeg</small></figcaption>
</figure>

</div>

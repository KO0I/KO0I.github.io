---
layout: post
title: "Marain should be able to rhyme, I think"
date: 2026-10-21
permalink: /marain-poetry-and-ship-names/
tags: [marain, culture, language, poetry, conlang]
---

I've been adding grammar to the [Marain dictionary]({{ '/marain/' | relative_url }}). Cases, modal expressions, a hypothetical `'tcha`, a patientive, and suffixes for planned events and consequences. It's getting easier to say precisely what you mean.

But would anyone actually want to write poetry in it?

I'd like to think the Culture would. A language used by people and Minds with plenty of time to be weird about language should probably have more going on than an adequate set of grammatical labels. The case system already permits a fairly flexible word order, which seems like a good start. I'd rather use that than bolt on a load of arbitrary endings just to make everything rhyme.

## Some things worth borrowing ideas from

I went looking at several poetic traditions, which have rather more interesting answers to this problem than simply making the last word of every line sound the same.

| Tradition | Thing I want to try in Marain |
| --- | --- |
| [Scottish Gaelic song and bardic verse](https://pressbooks.atlanticoer-relatlantique.ca/gaelicsong/chapter/gaelic-song-education-project-raghnaid-student-directed-song-discussion/) | *Aicill*, where line endings and words within neighboring lines echo, as well as alliteration and vowel rhyme. |
| [Welsh *cynghanedd*](https://www.poetryfoundation.org/poetrymagazine/articles/70172/extreme-welsh-meter) | Repeated consonant patterns across parts of a line. Almost a bit of signal processing for sentences. |
| [Persian ghazals](https://www.iranicaonline.org/articles/gazal-1-history/) | A changing rhyme followed by a fixed refrain (*qafia* and *radif*). |
| [Arabic *sajʿ*](https://al-balagha.com/wiki/RHYMED%3A_Rhetorical_Rhymed_Prose) | Rhymed prose, so a sentence can sound deliberate without everyone breaking into verse. |
| [Japanese *kakekotoba*](https://www.japanesewiki.com/literature/Kakekotoba.html) | Pivot words carrying multiple readings. Marain's existing `luh` means wind, current, or flow, which seems useful. |
| [Turkish vowel harmony](https://laits.utexas.edu/phonology/turkish/harmony4.html) | A comparison for how suffix vowels can respond to their surroundings, though that's not a historical Marain rule. |

The important part is **not** to confuse influence with historical Marain grammar. These are possibilities for extending a conlang, not more recovered Banks material.

## Rhyming without breaking the grammar

For example, these are deliberately simple lines:

> `ra'yuh kabo maraynva, gra.`  
> `geyuh intlemih prenva, gra.`

“I speak Marain, truly; you see a spaceship, truly.” The endings on `maraynva` and `prenva` chime, and `gra` repeats as an affirmation. That's a proposed poetic use of an existing *true/correct* word, not a recovered grammatical particle.

I'd also like to try a controlled **poetic conjugation**. Ordinary prose keeps `'tcha` for hypotheticals, `'wolug` for planned events, and `'inayng` for consequences. For verse I've added two optional cadences to the latter pair, which you can try under the **Poetry** tab of the [Marain dictionary]({{ '/marain/' | relative_url }}):

| Ordinary | Poetic -a | Poetic -i |
| --- | --- | --- |
| `uprahay'wolug` | `uprahay'woluga` | `uprahay'wolugi` |
| `kabo'inayng` | `kabo'inaynga` | `kabo'inayngi` |

They **don't mean anything different**. They're sound choices, and the tooling can convert them back into the underlying form. The special letter-deletion rule for `'tcha` stays unchanged. I wasn't going to sacrifice the rules we just worked out for another rhyme.

Scottish Gaelic also gave me an idea: [lenition](https://learngaelic.scot/grammar_hacks/lenition.jsp), where grammar changes the beginning of a word. I haven't copied the entire Gaelic system, but I've added a small optional Marain poetic mutation after `po` (small): `p → f`, `b → v`, `t → th`, `s → sh` and `k → ch`. So `po pren` (small spaceship) can become `po fren` in verse.

The ordinary dictionary entry stays `pren`. The tool only does this when the poetic trigger is explicit, and refuses a mutation if it would collide with an existing entry. A sound change that accidentally means something else seems a bad way to write a poem.

There is already wordplay in the dictionary, too. We recently proposed `gralemih` (true + sense) for *know*. Reversing those components could give `lemihgra` (sense + true) for *test or verify*. Not identical meanings, but a pleasing little pair.

## Heavy messing, and a Gaelic detour

I was given this proposed Scottish Gaelic translation for the Culture's “That's heavy messing”:

> ’S e trom-bhùrach a th’ ann gu dearbh.

[Am Faclair Beag](https://www.faclair.com/?txtSearch=b%C3%B9rach) lists `bùrach` with the sense of *mess/shambles*, and the [entry for `trom`](https://www.faclair.com/?txtSearch=trom) includes the heavy/intensive prefix. [LearnGaelic](https://learngaelic.scot/littlebylittle/unit06/index.jsp) describes the `’S e … a th’ ann` identity construction, and `gu dearbh` means something like *indeed*.

The individual pieces have an intelligible structure, but I couldn't verify the whole sentence as an established Gaelic expression. There's a semantic problem too: *heavy messing* in the Culture might mean seriously interfering with someone else's affairs, not just producing an enormous shambles.

Still, a Gaelic-inspired borrowing is appealing: **`burach`**, from Gaelic `bùrach`, for *a mess/shambles*. The existing Marain `hegayret` means *serious*, so `hegayret burach` gives “serious mess.” Not the same thing as the idiomatic *heavy messing*, but I like the sound.

## Trying the ship names

I also tried translating some [Culture ship names](https://groups.google.com/g/alt.books.iain-banks/c/xOOJ326qRSI). The Minds' jokes are not always especially kind to translators. These are *working renderings*, not established Banks Marain, and I've marked new words and rough approximations.

| Culture ship name | Working Marain | Translation notes |
| --- | --- | --- |
| *Grey Area* | `dzodmlingi zesu` | Grey + place, both existing dictionary words. The other sense of “grey area” gets lost. |
| *Zero Gravitas* | `nhech hegayretmara` | Zero + gravitas, both existing. That one was mercifully straightforward. |
| *Very Little Gravitas Indeed* | `po hegayretmara gra` | Little gravitas, truly. Doesn't separately translate *very*. |
| *Just Testing* | `lemihgra` | **New:** sense + true, *test/verify*. “Just” is left implicit. |
| *Just Read the Instructions* | `gaflemih ketiva` | **New:** `gaflemih` = read (word + sense). `ketiva` marks instruction as object; the imperative and “just” are unresolved. |
| *Of Course I Still Love You* | `gra, ra'yuh saynowetsiki leimalan geva` | **New:** `saynowetsiki` approximates still/continuing. `gra` is only a loose “of course.” |
| *I Thought He Was With You* | `ra'yuh heth bechumli toyuh sayno geye` | Existing words, proposed belief construction; tense scope remains approximate. Marain `to` doesn't mark gender. |
| *What Are the Civilian Applications?* | `shay hechrayspatsmaychrayti iltsiwi` | **Very rough:** “which non-war uses?” New non-war compound is **not** equivalent to the social meaning of *civilian*. |

Those new roots now have provisional dictionary entries and their derivations recorded, rather than promoting entire ship names to vocabulary. An approximate translation should stay visibly approximate.

And `owatau luhva` is a working rendering of *Look to Windward*—a book title rather than a ship name. It helps to check these things before making a table.

Anyway, I think there's room for Marain to be not just intelligible but playful. The culture of the Culture should be allowed a little linguistic showing off. Preferably without losing track of which bits we actually know.

The [poetic-register rules]({{ '/assets/marain/poetic-register.md' | relative_url }}) distinguish the proposed forms from recovered grammar and describe what the program can actually generate.

---
layout: post
title: "Trying To Render Math Symbols"
categories: math, 
image: 'images/10.jpg'
mathjax: true
mermaid: true
wavedrom: true
---

# Motivation

I struggled enough with the matter that I figured maybe it was worth typing a bit about it.

I have a lot of notes in $$\LaTeX$$, so I figure that sooner or later I would need to add to the site dependencies (ugh) to support math symbols being rendered if I wanted to discuss any of my notes from university. Mathjax is the heavier, but more feature-complete version. I might also give katex a stumbling try, but my priority as it stands is if it can render more or less of the types of aligned equations I have already written and also want to add to my modest and human-maintained blog here.

That is, katex might be lighter and faster, but it will not matter to me if I have to re-write many equations so they render as I prefer.


## Math Text attempt with `$$`

Looked magnificent in github, but this is supposed to render on jekyll! I tried mirroring a tutorial exactly not accounting for a nuance.

The problem seemed to be that wherever I tried to pull in mathjax wasn't being used in the posts. But even though `$$` eventually worked, I do not want to be pulling in stuff over NPM, that's a smell, and I don't need the absolute newest version of mathjax.

General form of the cosine function:
  $$\cos(x) = 1 - \frac{x^2}{2} + \frac{x^4}{24} - \cdots$$


## Tried and fail: three backticks
Triple backticks crashes something and page misbehavior. 

General form of the cosine function:
\`\`\`math
  \cos(x) = 1 - \frac{x^2}{2} + \frac{x^4}{24} - \cdots
\`\`\`math


# Graphs

Moving on with the subject of extending my site. I would also like to be able to visually represent certain mathematical
concepts visually. $$\LaTeX$$ genuinely sucks at circuits, timing
diagrams, and state machines. So, *mathjax* is not enough for what I might discuss and document.

## State Machines/Directed Graphs

State machines come up all the time in digital logic.

Since they're just a specific flavor of directed graph, state machines also count as being on-topic.

In my previous job I used Visio, and I rather strongly disliked it, so here's a Mermaid plot for a state machine:

### vim sidenote:

At first, the following rendered as rounded rectangles. To fix this in vim, I
selected the text and:

```
s/\%V[()]/&&/g
```

to double-up `(` and `)` to change the graph style:

<pre class="mermaid">
graph TD
    RESET((RESET)) --> A((Idle))
    A((Idle)) --> B((Fetch))
    B --> C((Decode))
    C --> D((Execute))
    D --> E((Writeback))
    E --> A((Idle))
</pre>

## Timing Diagrams

I also draw up and look at timing relationships, and it frankly sucks a lot to exchange screenshots of these things and squint at them. There is a better way than frittering away time resizing so it's readable, or inverting to make it consistent with a theme or more practically, less wasteful of toner when
being printed.

This [particular repo](https://github.com/MaximilianKoestler/markdown-wavedrom/blob/main/README.md) is of
interest for this purpose. But something tells me that it won't work
because Jekyll served on github's stuff probably would not allow me to run
some python ... ah I'll try it anyway.

<script type="WaveDrom">
{ signal: [
  { name: "clk",  wave: "p......." },
  { name: "req",  wave: "0.1..0.." },
  { name: "ack",  wave: "0..1.0.." },
  { name: "data", wave: "x.345x..", data: ["A", "B", "C"] }
]}
</script>

Something should have been posted. The fact not, well, maybe I can look at
[this next
example](https://maximiliankoestler.github.io/markdown-wavedrom-mkdocs-example/)
uses mkdocs and it looks very nice, but it would make for islands on my site.

Perhaps this would make sense for a self-contained project, but I'd like
to have wavedrom content visible alongside $$\LaTeX$$ equations and
mermaid diagrams.

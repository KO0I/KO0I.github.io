---
layout: post
title: "Trying To Render Math Symbols"
categories: math, test
image: 'images/10.jpg'
mathjax: true
---

# Motivation

I have a lot of notes in \LaTeX, so I figure that sooner or later I would need to add to the dependencies (ugh) to support math symbols being rendered if I wanted to discuss any of my notes from university. Mathjax is the heavier, but more feature-complete version. I might also give katex a stumbling try, but my priority as it stands is if it can render more or less of the types of aligned equations I might want to add to my modest and human-maintained blog here.

I struggled enough with the matter that I figured maybe it was worth typing a bit about it.

## Math Text attempt with two dollar symbols

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


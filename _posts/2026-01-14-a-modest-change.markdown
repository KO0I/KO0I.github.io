---
layout: post
title: "A Modest Site Change"
image: '/images/07.jpg'
categories: website, jekyll, link-share
---

# Some Background

There is a certain site that used to be popular that I left for Mastodon and Bluesky for. I probably do not have to mention the name for you to figure out which site.

Anyway, my lil site's template had some bits for link-sharing where it still referenced this site, and I made some changes that I think are nice enough to merit sharing with other Jekyll users. It's not much, but editing `/_layouts/post.html` will get the result I wanted.

## Proposed Changes: Add Bluesky

First, here is what I used to replace the Bad Site with Bluesky, a marginally less-worse site:

`<a class="share__link share__bluesky" href="https://bsky.app/intent/compose?text={{ page.title | uri_escape }}%0A%0A{{ site.url }}{{ site.baseurl }}{{ page.url | uri_escape }}" onclick="window.open(this.href, 'pop-up', 'left=20,top=20,width=900,height=500,toolbar=1,resizable=0'); return false;" title="Share on Bluesky" rel="nofollow"><i class="fa-brands fa-bluesky"></i></a>`

## Proposed Changes: Add Instagram

I don'e like insta as it's one of those Meta products, but whatever, it is a great spot to share art stuff.

Here's an entry you can add to `post.html` if you don't already have something for Instagram:

`<a class="share__link share__instagram" href="https://www.instagram.com/" onclick="navigator.clipboard.writeText('{{ site.url }}{{ site.baseurl }}{{ page.url }}'); window.open(this.href, 'pop-up', 'left=20,top=20,width=900,height=500,toolbar=1,resizable=0'); return false;" title="Copy link and open Instagram" rel="nofollow"><i class="fa-brands fa-instagram"></i></a>`


# Until Next Time

See result below, no bad site in sight!



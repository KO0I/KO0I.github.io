---
layout: page
marain_title: "laysoeter skatsa"
title: Game
permalink: /tools/
image: '/images/surf.png'
---

<link rel="stylesheet" href="{{ '/assets/marain/css/marain.css' | relative_url }}">

# <span class="marain">lasoeter skatsa</span>
*Laysoeter,*   *v.* to play (as in a videogame)

*Skatsa,*   *n.* writing tool (from pen to IDE)

---

# Space Exploration Game

#### <font color="aqua">𒾫</font> [Game Roadmap](/roadmap/)

Shaky Browser Prototype [here](https://chipchirp.digital/rfl/)

**Special Thanks to [Loren Shmidt](https://lorenschmidt.itch.io/) for the amazing Comanche renderer
approach with overhangs**

# <font color="pink"> Tooling</font>
#### <font color="red" size=14>𓆝</font> [X-PixMap WorkBench](/tools/serializable-pixel-art) 
*(Special thanks to [Tea Reggi](https://reggi.com) for making and sharing the original workbench)*

####  <font color="orange" size=14>𓐍</font> [Planetary Climate Workbench](/tools/rfl-climate-workbench/dist)

*(Uses ExoPlaSim for terrestrials and magIC for gas giants, though I may "fake
out" the gas giants in the end)*


#### <font color="magenta" size=14>𓏲</font> [Nebula Workbench](/tools/rfl-nebula-workbench/dist)

*(Based heavily on [Don Juan Javier's Nebula Gen](https://donjuanjavier.itch.io/nebula-gen))*

#  <font color="lightblue">Lore</font>

#### <font color="teal" size=12>𓍰</font> [Marain Dictionary](/marain/)

*(Mirror and extension of [The original Marain dictionary](https://marain-tools.netlify.app/))*

#### <font color="green" size=14>𓆱</font> [Culture Ulterior Timeline](/culture-history/)

*(References [Culture Fandom Wiki](https://theculture.fandom.com/wiki/Timeline) for the main canonical timeline)*


### <span class="marain">HYLIG GUHNAYMERE ANONG</span>

---

## Gamedev Progress

Notes and screenshots from the development of **Rasd Fastwalker League**. These posts are rendered at build time from the site's existing Bluesky archive—no live embeds or browser-side feed scripts.

<div class="feature-list feature-list--gamedev">
  {% assign progress_count = 0 %}
  {% for post in site.posts %}
    {% if post.bsky_uri and post.tags contains 'rasdFastwalkerLeague' %}
      {% assign bsky_post_id = post.bsky_uri | split: '/' | last %}
      {% assign progress_text = post.content | markdownify | strip_html | normalize_whitespace | replace: 'View on Bluesky', '' | strip %}
      <article class="feature-list__item">
        <a class="feature-list__image" href="{{ post.url | relative_url }}">
          {% if post.image %}
            <img src="{{ post.image | relative_url }}" width="400" height="260" alt="{{ post.title | strip_html | escape }}" loading="lazy" decoding="async">
          {% else %}
            <img src="{{ '/images/surf.png' | relative_url }}" width="400" height="260" alt="Rasd Fastwalker League development" loading="lazy" decoding="async">
          {% endif %}
        </a>
        <div class="feature-list__copy">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%b %-d, %Y' }}</time>
          <h3><a href="{{ post.url | relative_url }}">{{ post.title | strip_html | escape }}</a></h3>
          <p>{{ progress_text | truncate: 280 | escape }}</p>
          <div class="feature-list__links">
            <a href="{{ post.url | relative_url }}">Read on ChipChirp →</a>
            <a href="https://bsky.app/profile/sesheta.chipchirp.digital/post/{{ bsky_post_id | escape }}" rel="noopener noreferrer">View on Bluesky ↗</a>
          </div>
        </div>
      </article>
      {% assign progress_count = progress_count | plus: 1 %}
      {% if progress_count >= 16 %}{% break %}{% endif %}
    {% endif %}
  {% endfor %}
  {% if progress_count == 0 %}<p>No game progress entries have been published yet.</p>{% endif %}
</div>

[More development posts on Bluesky](https://bsky.app/profile/sesheta.chipchirp.digital)

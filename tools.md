---
layout: page
marain_title: "laysoeter skatsa"
title: Game Tools
permalink: /tools/
image: '/images/surf.png'
---

<link rel="stylesheet" href="{{ '/assets/marain/css/marain.css' | relative_url }}">

<style>
.tool-symbol--color-wheel {
  display: inline-block;
  color: #00ffff;
  font-size: 1.9em;
  line-height: 0.8;
  vertical-align: -0.08em;
  font-family: 'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', sans-serif;
}
@supports ((background-clip: text) or (-webkit-background-clip: text)) {
  .tool-symbol--color-wheel {
    background-image: linear-gradient(90deg, #ff6b6b, #ffb347, #ffe66d, #66e58f, #00ffff, #8ca9ff, #e08bff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }
}
</style>

# <span class="marain">lasoeter skatsa</span>
*Laysoeter,*   *v.* to play (as in a videogame)

*Skatsa,*   *n.* writing tool (from pen to IDE)

---

# <span style="color: #fff;">Space Exploration Game</span>

#### <span style="color: #a860ff; font-size: 1.9em; line-height: 0.8; vertical-align: -0.08em;" aria-hidden="true">ᑝ</span> [Game Roadmap](/roadmap/)

#### <span style="color: pink; font-size: 1.9em; line-height: 0.8; vertical-align: -0.08em;" aria-hidden="true">ᐉ</span> Play Rasd Fastwalker League [in your browser](https://chipchirp.digital/rfl)

**Special Thanks to [Loren Schmidt](https://lorenschmidt.itch.io/) for the amazing Comanche renderer approach with overhangs, and for so many ideas about procedural generation**

# <span style="color: #fff;">Tooling</span>

#### <span class="tool-symbol--color-wheel" aria-hidden="true">𓇳</span> [Color Wheel]({{ '/tools/color-wheel/' | relative_url }})

*Explore color harmonies, drag the points, and copy your palette.*

#### <font color="red" size=14>𓆝</font> [X-PixMap WorkBench](/tools/serializable-pixel-art) 
*(Special thanks to [Tea Reggi](https://reggi.com) for making and sharing the original workbench)*

####  <font color="orange" size=14>𓐍</font> [Planetary Climate Workbench](/tools/rfl-climate-workbench/dist)

*(Uses ExoPlaSim for terrestrials and magIC for gas giants, though I may "fake
out" the gas giants in the end)*


#### <font color="magenta" size=14>𓏲</font> [Nebula Workbench](/tools/rfl-nebula-workbench/dist)

*(Based heavily on [Don Juan Javier's Nebula Gen](https://donjuanjavier.itch.io/nebula-gen))*

#### <span style="color: #29B6FF; font-size: 1.9em; line-height: 0.8; vertical-align: -0.08em;" aria-hidden="true">𓆏</span> [Interiors Workbench](/tools/rfl-interiors-workbench/dist/)

*Explore interior volumes, rooms, and spatial layouts in the browser.*

#### <span style="color: #9ACD32; font-size: 1.9em; line-height: 0.8; vertical-align: -0.08em; font-family: 'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', sans-serif;" aria-hidden="true">𓆸</span> [Plant Workbench]({{ '/tools/rfl-plant-workbench/dist/' | relative_url }})

# <span style="color: #fff;">Waves &amp; Vibes</span>

#### <span style="color: #a89b8b; font-size: 1.9em; line-height: 0.8; vertical-align: -0.08em; font-family: 'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', sans-serif;" aria-hidden="true">𓏢</span> [Interactive Camelot Wheel]({{ '/tools/camelot-wheel/' | relative_url }})

*Harmonic mixing key wheel; based on the [original by Mixed In Key](https://mixedinkey.com/camelot-wheel/#chart).*

#### <span style="color: #00ffff; font-size: 1.9em;" aria-hidden="true">∿</span> [CircuitJS Simulator]({{ '/tools/circuitjs/' | relative_url }})

*Build circuits, explore signals, and watch voltage and current change in your browser.*

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

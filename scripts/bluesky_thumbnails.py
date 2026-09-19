#!/usr/bin/env python3
"""Build a video-thumbnail gallery from Bluesky posts.

Downloads the thumbnail of every video post to assets/bluesky/ and writes
_data/bluesky.json for the gallery page (_pages/videos.html). Re-running is
incremental: existing thumbnails are kept, and bluesky.json is rebuilt from
the live feed (so deleted posts drop out).
"""

import json
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

HANDLE = "sesheta.chipchirp.digital"
API = "https://public.api.bsky.app/xrpc/"
UA = "chipchirp-digital-bsky-thumbnails/1.0 (https://chipchirp.digital)"
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets/bluesky"
DEST.mkdir(parents=True, exist_ok=True)


def fetch(url):
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=30) as response:
        return response.read()


profile = json.loads(fetch(
    API + "app.bsky.actor.getProfile?" + urlencode({"actor": HANDLE})
))
did = profile["did"]
items, seen = [], set()
cursor = None

while True:
    params = {"actor": did, "limit": 100}
    if cursor:
        params["cursor"] = cursor
    page = json.loads(fetch(
        API + "app.bsky.feed.getAuthorFeed?" + urlencode(params)
    ))

    for entry in page["feed"]:
        post = entry["post"]
        if post["author"]["did"] != did or post["uri"] in seen:
            continue
        seen.add(post["uri"])

        embed = post.get("embed", {})
        embed = embed.get("media", embed)
        if embed.get("$type") != "app.bsky.embed.video#view":
            continue
        if not embed.get("thumbnail"):
            continue

        key = post["uri"].rsplit("/", 1)[-1]
        filename = f"{key}.jpg"
        target = DEST / filename
        if not target.exists():
            target.write_bytes(fetch(embed["thumbnail"]))

        items.append({
            "image": f"/assets/bluesky/{filename}",
            "text": " ".join(post["record"].get("text", "").split()),
            "url": f"https://bsky.app/profile/{did}/post/{key}",
            "date": post["record"]["createdAt"],
        })

    cursor = page.get("cursor")
    if not cursor:
        break
    time.sleep(0.2)

items.sort(key=lambda item: item["date"], reverse=True)
data = ROOT / "_data"
data.mkdir(exist_ok=True)
(data / "bluesky.json").write_text(
    json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8"
)
print(f"Saved {len(items)} video thumbnail entries.")

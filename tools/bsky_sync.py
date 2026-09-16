#!/usr/bin/env python3
"""Sync Bluesky posts tagged #rasdFastwalkerLeague into Jekyll posts.

Reads the public author feed (no auth needed) and writes one markdown file
per new post into _posts/. The post body is the post's own text (with facet
links restored) followed by its attached images/GIFs, all downloaded into
images/bsky/ and referenced locally. The post's `image:` is a thumbnail of
the first attachment saved into images/bsky/ (image thumbnail, or the video
thumbnail for videos); posts without media get no image at all. Re-running
is idempotent: posts are keyed by their at:// URI stored in the `bsky_uri:`
front matter field.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

HANDLE = "sesheta.chipchirp.digital"
HASHTAG = "rasdfastwalkerleague"
API = "https://public.api.bsky.app/xrpc/"
UA = "chipchirp-digital-bsky-sync/1.0 (https://chipchirp.digital)"

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "_posts"
IMAGES_DIR = ROOT / "images" / "bsky"


def fetch_json(path, params):
    url = API + path + "?" + urlencode(params)
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=30) as resp:
        return json.load(resp)


def fetch_feed(max_pages):
    posts = []
    cursor = None
    for _ in range(max_pages):
        params = {
            "actor": HANDLE,
            "limit": 100,
            "filter": "posts_no_replies",
        }
        if cursor:
            params["cursor"] = cursor
        data = fetch_json("app.bsky.feed.getAuthorFeed", params)
        for item in data.get("feed", []):
            post = item["post"]
            if post["author"].get("handle") != HANDLE:
                continue  # skip reposts of other people
            posts.append(post)
        cursor = data.get("cursor")
        if not cursor or not data.get("feed"):
            break
    return posts


def synced_uris():
    uris = set()
    for path in sorted(POSTS_DIR.glob("*.markdown")) + sorted(POSTS_DIR.glob("*.md")):
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("bsky_uri:"):
                uris.add(line.split(":", 1)[1].strip())
                break
    return uris


def facet_markdown(text, facets):
    """Re-insert markdown links for link/mention facets.

    Facet index offsets are UTF-8 byte offsets into `text`.
    """
    if not facets:
        return text
    try:
        raw = text.encode("utf-8")
        out = raw
        for facet in sorted(facets, key=lambda f: f["index"]["byteStart"], reverse=True):
            start, end = facet["index"]["byteStart"], facet["index"]["byteEnd"]
            label = out[start:end].decode("utf-8")
            feature = facet["features"][0]
            uri = None
            if feature["$type"] == "app.bsky.richtext.facet#link":
                uri = feature["uri"]
            elif feature["$type"] == "app.bsky.richtext.facet#mention":
                uri = "https://bsky.app/profile/" + feature["did"]
            if uri:
                out = out[:start] + f"[{label}]({uri})".encode("utf-8") + out[end:]
        return out.decode("utf-8")
    except (KeyError, UnicodeDecodeError, IndexError):
        return text


def web_url(uri):
    _, _, rkey = uri[5:].rpartition("/app.bsky.feed.post/")
    return f"https://bsky.app/profile/{HANDLE}/post/{rkey}"


def title_from_text(text):
    for line in text.splitlines():
        words = [w for w in line.split() if not w.startswith("#")]
        if words:
            title = " ".join(words)
            return title[:60] + ("…" if len(title) > 60 else "")
    return "Bluesky post"


def slugify(title, date, existing):
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:44].strip("-")
    if not slug:
        slug = "post"
    candidate = f"{date}-{slug}"
    n = 2
    while (POSTS_DIR / f"{candidate}.markdown").exists() or candidate in existing:
        candidate = f"{date}-{slug}-{n}"
        n += 1
    existing.add(candidate)
    return candidate


def pds_endpoint(did):
    """Resolve a DID to its PDS service endpoint (cached)."""
    if did not in _pds_cache:
        try:
            if did.startswith("did:plc:"):
                doc = fetch_json_url(f"https://plc.directory/{did}")
            else:
                doc = fetch_json_url(f"https://bsky.app/xrpc/com.atproto.identity.resolveDID?did={did}")
            endpoint = next(
                s["serviceEndpoint"]
                for s in doc.get("service", [])
                if s.get("type") == "AtprotoPersonalDataServer"
            )
            _pds_cache[did] = endpoint.rstrip("/")
        except Exception:
            _pds_cache[did] = None
    return _pds_cache[did]


_pds_cache = {}


def fetch_json_url(url):
    with urlopen(Request(url, headers={"User-Agent": UA}), timeout=30) as resp:
        return json.load(resp)


def record_images(post):
    """Image list from the record layer: [{cid, mime, alt}, ...]."""
    embed = post["record"].get("embed") or {}
    media = embed
    if embed.get("$type") == "app.bsky.embed.recordWithMedia":
        media = embed.get("media") or {}
    if media.get("$type") != "app.bsky.embed.images":
        return []
    out = []
    for img in media.get("images") or []:
        ref = img.get("image", {}).get("ref", {}).get("$link")
        if ref:
            out.append({"cid": ref, "mime": img["image"].get("mimeType", ""), "alt": img.get("alt", "")})
    return out


def view_images(post):
    """Image list from the view layer: [{thumb, fullsize, alt}, ...]."""
    embed = post.get("embed") or {}
    media = embed
    if embed.get("$type") == "app.bsky.embed.recordWithMedia#view":
        media = embed.get("media") or {}
    if media.get("$type") == "app.bsky.embed.images#view":
        return media.get("images") or []
    return []


def view_media(post):
    """The post's view-layer media embed (for video thumbnails etc.)."""
    embed = post.get("embed") or {}
    if embed.get("$type") == "app.bsky.embed.recordWithMedia#view":
        return embed.get("media") or {}
    return embed


def sniff_ext(data):
    """Image extension from magic bytes (CDN Content-Types can't be trusted)."""
    if data[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


def download_media(url, stem):
    """Download a media file into images/bsky; return its site path."""
    if not url:
        return None
    try:
        req = Request(url, headers={"User-Agent": UA})
        with urlopen(req, timeout=60) as resp:
            data = resp.read()
        ext = sniff_ext(data)
        if not ext:
            return None
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        (IMAGES_DIR / f"{stem}{ext}").write_bytes(data)
        return f"/images/bsky/{stem}{ext}"
    except Exception as exc:
        print(f"  media download failed ({url}): {exc}")
        return None


def download_attachments(post, rkey):
    """Download every image attachment for the body; returns [(site_path, alt)]."""
    did = post["author"]["did"]
    pds = pds_endpoint(did)
    recs = record_images(post)
    views = view_images(post)
    out = []
    for i, rec in enumerate(recs):
        stem = f"{rkey}-{i + 1}"
        rel = None
        if pds:
            rel = download_media(f"{pds}/xrpc/com.atproto.sync.getBlob?did={did}&cid={rec['cid']}", stem)
        if rel is None and i < len(views):
            rel = download_media(views[i]["fullsize"], stem)
        if rel:
            out.append((rel, rec["alt"]))
    return out


def featured_thumbnail(post, rkey):
    """Thumbnail of the first attachment, saved into images/bsky/.

    Image posts use the first image's thumbnail; videos use the video
    thumbnail; external embeds use their preview. None for text-only posts.
    """
    views = view_images(post)
    if views:
        rel = download_media(views[0].get("thumb"), f"{rkey}-thumb")
        if rel:
            return rel
        recs = record_images(post)
        if recs:
            did = post["author"]["did"]
            pds = pds_endpoint(did)
            if pds:
                return download_media(
                    f"{pds}/xrpc/com.atproto.sync.getBlob?did={did}&cid={recs[0]['cid']}",
                    f"{rkey}-thumb",
                )
        return None
    media = view_media(post)
    mtype = media.get("$type", "")
    if mtype == "app.bsky.embed.video#view":
        return download_media(media.get("thumbnail"), f"{rkey}-thumb")
    if mtype == "app.bsky.embed.external#view":
        ext = media.get("external", {})
        uri = ext.get("uri", "")
        if uri.lower().split("?")[0].endswith(".gif"):
            return download_media(uri, f"{rkey}-thumb")
        return download_media(ext.get("thumb"), f"{rkey}-thumb")
    return None


def write_post(post, dry_run=False):
    record = post["record"]
    uri = post["uri"]
    rkey = uri.rsplit("/", 1)[-1]
    created = record["createdAt"][:10]
    plain_text = record.get("text", "")
    title = title_from_text(plain_text)
    body_text = facet_markdown(plain_text, record.get("facets"))

    escaped_lines = []
    for line in body_text.split("\n"):
        if line.startswith("#"):
            line = "\\" + line
        escaped_lines.append(line)
    body = "\n".join(escaped_lines).strip()

    if dry_run:
        print(f"  would sync: {created} {rkey}  {title}")
        return

    existing = set()
    name = slugify(title, created, existing)

    embeds = []
    for rel, alt in download_attachments(post, rkey):
        alt = alt.replace("\n", " ").replace("[", "").replace("]", "").replace("!", "")
        embeds.append(f"![{alt}]({rel})")
    if embeds:
        body = (body + "\n\n" if body else "") + "\n\n".join(embeds)

    body = (body + "\n\n" if body else "") + f"[View on Bluesky]({web_url(uri)})"

    thumb = featured_thumbnail(post, rkey)
    image_line = f"image:  '{thumb}'\n" if thumb else ""
    front = (
        "---\n"
        "layout: post\n"
        f"title: {json.dumps(title, ensure_ascii=False)}\n"
        + image_line +
        f"date: {created}\n"
        "tags:   [rasdFastwalkerLeague, bluesky]\n"
        f"bsky_uri: {uri}\n"
        "---\n\n"
    )
    (POSTS_DIR / f"{name}.markdown").write_text(front + body + "\n", encoding="utf-8")
    print(f"  synced: _posts/{name}.markdown" + (f" + {thumb}" if thumb else ""))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=0, help="max new posts to sync")
    parser.add_argument("--max-pages", type=int, default=40, help="feed pages to scan")
    parser.add_argument("--dry-run", action="store_true", help="print, do not write")
    args = parser.parse_args()

    print(f"Fetching feed of @{HANDLE} ...")
    posts = fetch_feed(args.max_pages)
    matches = [
        p for p in posts
        if HASHTAG in p["record"].get("text", "").lower()
    ]
    print(f"{len(posts)} posts scanned, {len(matches)} tagged #{HASHTAG}.")

    known = synced_uris()
    new = [p for p in matches if p["uri"] not in known]
    print(f"{len(new)} new to sync.")
    if args.limit:
        new = new[: args.limit]
    for post in new:
        write_post(post, dry_run=args.dry_run)
    print("Done.")


if __name__ == "__main__":
    sys.exit(main())

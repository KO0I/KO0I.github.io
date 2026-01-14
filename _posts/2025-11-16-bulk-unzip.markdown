---
layout: post
title: "Bulk Unzip"
image:  '/images/21.jpg'
date: 2025-11-16
tags:   [tips&tricks]
---

# Some Background

Sometimes I download a bunch of archives in zip format, and I don't always
have the files in a format without spaces and such.

After a few iterations, I came to the following:

```
find . -name '*.zip' -exec sh -c 'unzip -d "${0%.zip}" "$0"' {} \;
```

But if any of the zip archives were already extracted, I need to answer a
question to avoid clobbering. It holds up the extracting process. Ick!

Guess it's time to make a script unless someone is about to tell me there is
an easier way, but here goes:

```
# Create directory if needed, only extract if directory is empty

find . -name '*.zip' -exec sh -c '
 dir="${0%.zip}"
  if [ -d "$dir" ] && [ -n "$(ls -A "$dir" 2>/dev/null)" ]; then
    echo "Skipping: $dir"
  else
    echo "Extracting: $0"
    mkdir -p "$dir"
  fi
' {} \;
```

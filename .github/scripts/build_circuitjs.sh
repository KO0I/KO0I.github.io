#!/usr/bin/env bash
# Reproducible static build from Amber's fork; no third-party runtime embed.
set -euo pipefail
site_root=$(cd "$(dirname "$0")/../.." && pwd)
output=${1:-"$site_root/_site/tools/circuitjs/app"}
build_dir=$(mktemp -d)
trap 'rm -rf "$build_dir"' EXIT
revision=dd47cf43a1baa91e2d6ae0f5884ccf0f589989bf
git clone --quiet https://github.com/KO0I/circuitjs.git "$build_dir/source"
git -C "$build_dir/source" checkout --quiet "$revision"
curl --fail --location --retry 3 https://github.com/gwtproject/gwt/releases/download/2.10.0/gwt-2.10.0.zip -o "$build_dir/gwt.zip"
printf '%s  %s\n' 3be5fe11c27e8fd5a513eff8b14c2f26999faf4b991a8ad428f1916a36884427 "$build_dir/gwt.zip" | sha256sum --check
unzip -q "$build_dir/gwt.zip" -d "$build_dir"
cd "$build_dir/source"
# GitHub Pages has no PHP relay. Disable its menu action in our build.
sed -i 's/shortRelaySupported = true/shortRelaySupported = false/' src/com/lushprojects/circuitjs1/client/circuitjs1.java
java -Xmx2g -cp "$build_dir/gwt-2.10.0/*:src" com.google.gwt.dev.Compiler -localWorkers 2 -war war com.lushprojects.circuitjs1.circuitjs1
mkdir -p "$output"
cp -R war/. "$output/"
rm -rf "$output/WEB-INF" "$output/shortrelay.php"
cp COPYING.txt "$output/"
# Include the exact modified source plus instructions and this build recipe.
cp "$site_root/.github/scripts/build_circuitjs.sh" BUILD-CHIPCHIRP.sh
tar -czf "$output/source.tar.gz" src war/circuitjs.html war/iframe.html war/lz-string.min.js war/font COPYING.txt README.md BUILD-CHIPCHIRP.sh
printf '{"repository":"KO0I/circuitjs","revision":"%s","gwt":"2.10.0","shortRelaySupported":false}\n' "$revision" > "$output/version.json"
python3 - "$output/circuitjs.html" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
p.write_text(p.read_text().replace('<title></title>', '<title>CircuitJS · ChipChirp</title>'))
PY
test -s "$output/circuitjs1/circuitjs1.nocache.js"
test -s "$output/circuitjs1/setuplist.txt"

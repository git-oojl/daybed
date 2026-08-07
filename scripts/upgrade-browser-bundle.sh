#!/usr/bin/env bash
# Upgrade an already-built Daybed fat bundle with Playwright + Chromium.
# Run on internet-connected Debian 13 / WSL2 x86_64.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

[[ "$(uname -s)" == "Linux" ]] || { echo "Run this on Linux." >&2; exit 2; }
[[ "$(uname -m)" == "x86_64" ]] || { echo "Run this on x86_64." >&2; exit 2; }
require_command node
require_command npm
require_command curl
require_command tar

mkdir -p "$NPM_CACHE_DIR" "$PLAYWRIGHT_BROWSERS_DIR"

# Add a stable, exact Playwright package to both package.json and package-lock.json,
# while retaining all packages in the bundle's npm cache for later offline npm ci.
(
  cd "$ROOT/frontend"
  npm install --save-dev --save-exact "playwright@$PLAYWRIGHT_VERSION" \
    --cache "$NPM_CACHE_DIR" --no-audit --no-fund
)

# Download only Chromium-family artifacts required by this Playwright release
# into the project, not into ~/.cache. Playwright 1.38+ does not fetch browsers
# during npm install, so this explicit step is required.
(
  cd "$ROOT/frontend"
  PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_DIR" \
    "$ROOT/frontend/node_modules/.bin/playwright" install chromium
)

# Verify all dependencies on this builder. On Debian/Ubuntu, install host browser
# libraries once if this check reports missing shared libraries:
#   sudo env PATH="$PATH" npx playwright install-deps chromium
"$ROOT/scripts/agent-bootstrap.sh"
"$ROOT/scripts/agent-validate.sh"
"$ROOT/scripts/agent-smoke.sh"

# Prove npm can reconstruct node_modules offline with Playwright included.
rm -rf "$ROOT/frontend/node_modules"
(
  cd "$ROOT/frontend"
  npm ci --offline --cache "$NPM_CACHE_DIR" --no-audit --no-fund
)
"$ROOT/scripts/agent-browser-check.sh"

# Keep the final upload clean and reproducible; destination bootstrap recreates these.
rm -rf "$ROOT/backend/.venv" "$ROOT/frontend/node_modules" "$ROOT/frontend/dist" "$ROOT/.agent-logs"
rm -f "$ROOT/backend/.env" "$ROOT/frontend/.env" "$ROOT/backend/db.sqlite3"
rm -rf "$ROOT/backend/media" "$ROOT/backend/staticfiles"

# Make the archive relocatable: uv and uv-managed Python may create absolute
# cache/runtime symlinks pointing at the builder checkout.
"$ROOT/scripts/agent-relativize-vendor-links.sh"

parent="$(dirname "$ROOT")"
name="$(basename "$ROOT")"
out="$parent/${name}-openai-sandbox-linux-x86_64-playwright.tar.gz"
rm -f "$out"
tar \
  --exclude='./backend/.venv' \
  --exclude='./frontend/node_modules' \
  --exclude='./.git' \
  -C "$parent" -czf "$out" "$name"

printf '\nCreated browser-complete bundle:\n  %s\n' "$out"
echo "Upload it, then run: make bootstrap && make validate && make smoke"

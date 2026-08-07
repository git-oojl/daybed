#!/usr/bin/env bash
# Refresh Playwright + Chromium after PLAYWRIGHT_VERSION changes.
# Run on internet-connected Debian/WSL2 Linux x86_64. Final packaging is
# delegated to finalize-sandbox-bundle.sh for the canonical ready archive.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

[[ "$(uname -s)" == "Linux" ]] || { echo "Run this on Linux." >&2; exit 2; }
[[ "$(uname -m)" == "x86_64" ]] || { echo "Run this on x86_64." >&2; exit 2; }
require_command node
require_command npm

mkdir -p "$NPM_CACHE_DIR" "$PLAYWRIGHT_BROWSERS_DIR"

# Keep package.json/package-lock aligned with the tracked runtime contract and
# retain the package in the bundle's npm cache for later offline npm ci.
(
  cd "$ROOT/frontend"
  npm install --save-dev --save-exact "playwright@$PLAYWRIGHT_VERSION" \
    --cache "$NPM_CACHE_DIR" --no-audit --no-fund
  PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_DIR" \
    "$ROOT/frontend/node_modules/.bin/playwright" install chromium
)

# If browser-check later reports missing Linux shared libraries on a fresh WSL
# distro, run: make browser-deps
exec "$ROOT/scripts/finalize-sandbox-bundle.sh"

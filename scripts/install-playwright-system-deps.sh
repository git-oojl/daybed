#!/usr/bin/env bash
# Install Debian/Ubuntu shared libraries required by the vendored Chromium.
# Use only when make browser-check reports missing host libraries.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

if [[ ! -x "$ROOT/frontend/node_modules/.bin/playwright" ]]; then
  echo "Playwright node_modules are missing. Run make bootstrap first." >&2
  exit 2
fi
if [[ ! -d "$PLAYWRIGHT_BROWSERS_DIR" ]]; then
  echo "Vendored browsers are missing. Restore/rebuild .vendor first." >&2
  exit 2
fi
command -v sudo >/dev/null 2>&1 || { echo "sudo is required to install system packages." >&2; exit 2; }

cd "$ROOT/frontend"
sudo env \
  PATH="$PATH" \
  PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_DIR" \
  ./node_modules/.bin/playwright install-deps chromium

echo "Playwright Chromium host dependencies installed. Run: make browser-check"

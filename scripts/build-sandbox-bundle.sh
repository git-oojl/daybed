#!/usr/bin/env bash
# Rebuild the complete hermetic vendor payload from the tracked runtime/lockfiles.
# Run on an internet-connected Linux x86_64 machine. The final packaging and
# cold acceptance are delegated to finalize-sandbox-bundle.sh so every build
# path produces the same relocatable playwright-ready archive convention.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Capture the host uv before agent-common may prepend an existing .vendor/bin.
HOST_UV="$(command -v uv || true)"

# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

[[ "$(uname -s)" == "Linux" ]] || { echo "This bundle must be built on Linux." >&2; exit 2; }
[[ "$(uname -m)" == "x86_64" ]] || { echo "This bundle must be built on x86_64." >&2; exit 2; }
[[ -n "$HOST_UV" ]] || { echo "Missing host uv. Install uv before rebuilding the bundle." >&2; exit 2; }
require_command node
require_command npm
require_command tar
require_command curl

mkdir -p "$VENDOR_DIR" "$UV_CACHE_DIR" "$NPM_CACHE_DIR" "$VENDOR_PYTHON_DIR" "$VENDOR_BIN_DIR" "$PLAYWRIGHT_BROWSERS_DIR"

# Freeze host uv so target execution does not depend on the sandbox's uv.
rm -f "$VENDOR_BIN_DIR/uv"
cp "$HOST_UV" "$VENDOR_BIN_DIR/uv"
chmod +x "$VENDOR_BIN_DIR/uv"

nodever="$(node --version | sed 's/^v//')"
if ! version_ge "$nodever" "22.12.0"; then
  echo "Node $nodever is too old to build the frontend payload." >&2
  exit 3
fi

# Freeze the exact official Node.js Linux x64 runtime, including npm.
rm -rf "$VENDOR_NODE_DIR"
node_archive="$VENDOR_DIR/node-v${NODE_VERSION}-linux-x64.tar.xz"
curl -fL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o "$node_archive"
tar -xJf "$node_archive" -C "$VENDOR_DIR"
mv "$VENDOR_DIR/node-v${NODE_VERSION}-linux-x64" "$VENDOR_NODE_DIR"
rm -f "$node_archive"
export PATH="$VENDOR_NODE_DIR/bin:$VENDOR_BIN_DIR:$PATH"

# Download the exact portable CPython runtime into the repository payload.
rm -rf "$VENDOR_PYTHON_DIR"
mkdir -p "$VENDOR_PYTHON_DIR"
UV_CACHE_DIR="$UV_CACHE_DIR" UV_PYTHON_INSTALL_DIR="$VENDOR_PYTHON_DIR" \
  uv python install "$PYTHON_VERSION" --install-dir "$VENDOR_PYTHON_DIR" --no-bin
vendored_python="$(find_vendor_python)"

# Populate uv's cache from the exact lock. Destination bootstrap will recreate
# the virtualenv; do not make the archive depend on this builder's .venv.
(
  cd "$ROOT/backend"
  rm -rf .venv
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_PYTHON="$vendored_python" \
    uv sync --frozen --python "$vendored_python"
  rm -rf .venv
)

# Populate npm's cache from package-lock and download the exact Playwright
# Chromium into the project-local browser payload.
(
  cd "$ROOT/frontend"
  rm -rf node_modules
  npm ci --cache "$NPM_CACHE_DIR" --no-audit --no-fund
  PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_DIR" \
    "$ROOT/frontend/node_modules/.bin/playwright" install chromium
)

# One canonical finalization path performs bootstrap, validation, real browser
# smoke, relocation repair, clean packaging, and cold archive acceptance.
exec "$ROOT/scripts/finalize-sandbox-bundle.sh"

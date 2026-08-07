#!/usr/bin/env bash
# Run this on an internet-connected Linux x86_64 machine.
# It creates a fat archive that can bootstrap in a network-isolated Linux x86_64 sandbox.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Capture the host uv before agent-common prepends .vendor/bin to PATH.
HOST_UV="$(command -v uv || true)"

# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

[[ "$(uname -s)" == "Linux" ]] || { echo "This bundle must be built on Linux." >&2; exit 2; }
[[ "$(uname -m)" == "x86_64" ]] || { echo "This bundle must be built on x86_64." >&2; exit 2; }
[[ -n "$HOST_UV" ]] || {
  echo "Missing host uv. Install uv before building the bundle." >&2
  exit 2
}
require_command node
require_command npm
require_command tar
require_command curl

mkdir -p "$VENDOR_DIR" "$UV_CACHE_DIR" "$NPM_CACHE_DIR" "$VENDOR_PYTHON_DIR" "$VENDOR_BIN_DIR"

# Freeze host uv so target execution does not depend on the sandbox's uv version.
rm -f "$VENDOR_BIN_DIR/uv"
cp "$HOST_UV" "$VENDOR_BIN_DIR/uv"
chmod +x "$VENDOR_BIN_DIR/uv"

nodever="$(node --version | sed 's/^v//')"
if ! version_ge "$nodever" "22.12.0"; then
  echo "Node $nodever is too old to build the frontend payload." >&2
  exit 3
fi

# Freeze an exact official Node.js Linux x64 runtime, including npm.
rm -rf "$VENDOR_NODE_DIR"
node_archive="$VENDOR_DIR/node-v${NODE_VERSION}-linux-x64.tar.xz"
curl -fL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o "$node_archive"
tar -xJf "$node_archive" -C "$VENDOR_DIR"
mv "$VENDOR_DIR/node-v${NODE_VERSION}-linux-x64" "$VENDOR_NODE_DIR"
rm -f "$node_archive"
export PATH="$VENDOR_NODE_DIR/bin:$VENDOR_BIN_DIR:$PATH"

# Download an exact portable CPython runtime into the repository payload.
UV_CACHE_DIR="$UV_CACHE_DIR" UV_PYTHON_INSTALL_DIR="$VENDOR_PYTHON_DIR" \
  uv python install "$PYTHON_VERSION" --install-dir "$VENDOR_PYTHON_DIR" --no-bin
vendored_python="$(find_vendor_python)"

# Populate uv's cache using the exact lock, then remove the host-created venv so destination bootstrap recreates it.
(
  cd "$ROOT/backend"
  rm -rf .venv
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_PYTHON="$vendored_python" \
    uv sync --frozen --python "$vendored_python"
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_PYTHON="$vendored_python" \
    uv run python manage.py check
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_PYTHON="$vendored_python" \
    uv run pytest -q
  rm -rf .venv
)

# Populate npm's content-addressed cache from the lock, validate, then omit node_modules from the bundle.
(
  cd "$ROOT/frontend"
  rm -rf node_modules
  npm ci --cache "$NPM_CACHE_DIR" --no-audit --no-fund
  PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_DIR" "$ROOT/frontend/node_modules/.bin/playwright" install chromium
  npm run validate
)

# Exercise the real vendored browser against the running Django + Vite stack.
"$ROOT/scripts/agent-bootstrap.sh"
"$ROOT/scripts/agent-smoke.sh"
rm -rf "$ROOT/frontend/node_modules" "$ROOT/backend/.venv" "$ROOT/.agent-logs"

# Never include local secrets or mutable databases in the upload bundle.
rm -f "$ROOT/backend/.env" "$ROOT/frontend/.env" "$ROOT/backend/db.sqlite3"
rm -rf "$ROOT/backend/media" "$ROOT/backend/staticfiles"

# Make the archive relocatable: uv and uv-managed Python may create absolute
# cache/runtime symlinks pointing at the builder checkout.
"$ROOT/scripts/agent-relativize-vendor-links.sh"

parent="$(dirname "$ROOT")"
name="$(basename "$ROOT")"
out="$parent/${name}-openai-sandbox-linux-x86_64.tar.gz"
rm -f "$out"
tar \
  --exclude='./backend/.venv' \
  --exclude='./frontend/node_modules' \
  --exclude='./.git' \
  -C "$parent" -czf "$out" "$name"

echo "Created: $out"
echo "Upload that fat archive to the sandbox, then run: make bootstrap && make validate"

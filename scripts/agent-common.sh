#!/usr/bin/env bash
set -euo pipefail

AGENT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$AGENT_ROOT/agent/runtime.env"

VENDOR_DIR="$AGENT_ROOT/.vendor"
UV_CACHE_DIR="$VENDOR_DIR/uv-cache"
NPM_CACHE_DIR="$VENDOR_DIR/npm-cache"
VENDOR_PYTHON_DIR="$VENDOR_DIR/python"
VENDOR_NODE_DIR="$VENDOR_DIR/node"
VENDOR_BIN_DIR="$VENDOR_DIR/bin"
PLAYWRIGHT_BROWSERS_DIR="$VENDOR_DIR/playwright-browsers"
export PLAYWRIGHT_BROWSERS_PATH="$PLAYWRIGHT_BROWSERS_DIR"

# Keep the offline bundle independent of package-index settings injected by the host.
# The vendored uv cache was populated from the default PyPI index; inherited mirror
# variables can make uv look in a different cache namespace even with --offline.
unset UV_INDEX_URL UV_DEFAULT_INDEX UV_EXTRA_INDEX_URL UV_INDEX UV_NO_INDEX UV_FIND_LINKS
unset PIP_INDEX_URL PIP_EXTRA_INDEX_URL PIP_NO_INDEX

# Prefer exact runtimes shipped in a fat sandbox bundle.
if [[ -d "$VENDOR_NODE_DIR/bin" ]]; then
  export PATH="$VENDOR_NODE_DIR/bin:$PATH"
fi
if [[ -d "$VENDOR_BIN_DIR" ]]; then
  export PATH="$VENDOR_BIN_DIR:$PATH"
fi

find_vendor_python() {
  local candidate
  candidate="$(find "$VENDOR_PYTHON_DIR" -type f \( -name 'python3.12' -o -name 'python' \) -path '*/bin/*' 2>/dev/null | head -n 1 || true)"
  if [[ -n "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return 0
  fi
  return 1
}

select_python() {
  if [[ -x "$AGENT_ROOT/backend/.venv/bin/python" ]]; then
    "$AGENT_ROOT/backend/.venv/bin/python" - <<'PY' >/dev/null 2>&1 || return 1
import sys
raise SystemExit(0 if sys.version_info[:2] == (3, 12) else 1)
PY
    printf '%s\n' "$AGENT_ROOT/backend/.venv/bin/python"
    return 0
  fi

  local vendored
  vendored="$(find_vendor_python || true)"
  if [[ -n "$vendored" ]]; then
    printf '%s\n' "$vendored"
    return 0
  fi

  if command -v python3.12 >/dev/null 2>&1; then
    command -v python3.12
    return 0
  fi
  return 1
}

require_command() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required command: $name" >&2
    return 1
  fi
}

version_ge() {
  # Returns success when $1 >= $2 using sort -V.
  [[ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" == "$2" ]]
}

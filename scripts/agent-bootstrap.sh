#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

require_command uv
require_command node
require_command npm

[[ -f "$ROOT/backend/.env" ]] || cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
[[ -f "$ROOT/frontend/.env" ]] || cp "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"

py="$(select_python 2>/dev/null || true)"
if [[ -z "$py" ]]; then
  cat >&2 <<'MSG'
No Python 3.12 runtime is available.
This repository intentionally keeps the backend's Python 3.12 lock intact.
In an offline Linux sandbox, upload a fat bundle containing .vendor/python and dependency caches.
Build one on an internet-connected Linux x86_64 host with:
  bash scripts/build-sandbox-bundle.sh
MSG
  exit 2
fi

backend_python="$py"
if [[ ! -x "$ROOT/backend/.venv/bin/python" ]]; then
  if [[ ! -d "$UV_CACHE_DIR" ]]; then
    echo "Missing $UV_CACHE_DIR; cannot install backend dependencies offline." >&2
    exit 3
  fi
  (
    cd "$ROOT/backend"
    UV_CACHE_DIR="$UV_CACHE_DIR" UV_OFFLINE=1 UV_PYTHON="$backend_python" \
      uv sync --frozen --offline --python "$backend_python"
  )
else
  # Re-sync deterministically if the cache is available; otherwise trust the already-built environment.
  if [[ -d "$UV_CACHE_DIR" ]]; then
    (
      cd "$ROOT/backend"
      UV_CACHE_DIR="$UV_CACHE_DIR" UV_OFFLINE=1 \
        uv sync --frozen --offline --python "$ROOT/backend/.venv/bin/python"
    )
  fi
fi

if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
  if [[ ! -d "$NPM_CACHE_DIR" ]]; then
    echo "Missing $NPM_CACHE_DIR; cannot install frontend dependencies offline." >&2
    exit 4
  fi
  (
    cd "$ROOT/frontend"
    npm ci --offline --cache "$NPM_CACHE_DIR" --no-audit --no-fund
  )
fi

(
  cd "$ROOT/backend"
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_OFFLINE=1 uv run --offline python manage.py migrate --noinput
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_OFFLINE=1 uv run --offline python manage.py seed_demo
  UV_CACHE_DIR="$UV_CACHE_DIR" UV_OFFLINE=1 uv run --offline python manage.py check
)

echo "Bootstrap complete. Run: make validate"

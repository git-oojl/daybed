#!/usr/bin/env bash
# Validate and package the existing complete bundle without assuming any fixed
# workspace name/path. No network access is required. Existing local .env/db/
# media/.venv/node_modules state is restored when this script exits.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

stash="$(mktemp -d)"
stashed=()
restore_local_state() {
  local code=$?
  trap - EXIT INT TERM
  local rel src dst
  for rel in "${stashed[@]}"; do
    dst="$ROOT/$rel"
    src="$stash/$rel"
    rm -rf "$dst"
    mkdir -p "$(dirname "$dst")"
    mv "$src" "$dst"
  done
  rm -rf "$stash"
  exit "$code"
}
trap restore_local_state EXIT INT TERM

stash_path() {
  local rel="$1"
  local src="$ROOT/$rel"
  [[ -e "$src" || -L "$src" ]] || return 0
  mkdir -p "$stash/$(dirname "$rel")"
  mv "$src" "$stash/$rel"
  stashed+=("$rel")
}

for rel in \
  backend/.venv \
  frontend/node_modules \
  frontend/dist \
  backend/.env \
  frontend/.env \
  backend/db.sqlite3 \
  backend/media \
  backend/staticfiles \
  .agent-logs \
  .agent-tmp; do
  stash_path "$rel"
done

echo "==> Project root detected as: $ROOT"
echo "==> Repairing vendor links from any previous workspace"
"$ROOT/scripts/agent-relativize-vendor-links.sh"

echo "==> Validating working copy from vendored runtimes/caches"
"$ROOT/scripts/agent-doctor.sh"
"$ROOT/scripts/agent-bootstrap.sh"
"$ROOT/scripts/agent-validate.sh"
"$ROOT/scripts/agent-browser-check.sh"
"$ROOT/scripts/agent-smoke.sh"

# Remove only state created for validation; user's originals remain in stash.
rm -rf "$ROOT/backend/.venv" "$ROOT/frontend/node_modules" "$ROOT/frontend/dist" "$ROOT/.agent-logs" "$ROOT/.agent-tmp"
rm -f "$ROOT/backend/.env" "$ROOT/frontend/.env" "$ROOT/backend/db.sqlite3"
rm -rf "$ROOT/backend/media" "$ROOT/backend/staticfiles"

"$ROOT/scripts/agent-relativize-vendor-links.sh"
"$ROOT/scripts/agent-doctor.sh"

parent="$(dirname "$ROOT")"
name="$(basename "$ROOT")"
out="$parent/${name}-openai-sandbox-linux-x86_64-playwright-ready.tar.gz"
rm -f "$out"

echo "==> Packaging: $out"
tar \
  --exclude='./backend/.venv' \
  --exclude='./frontend/node_modules' \
  --exclude='./frontend/dist' \
  --exclude='./backend/.env' \
  --exclude='./frontend/.env' \
  --exclude='./backend/db.sqlite3' \
  --exclude='./backend/media' \
  --exclude='./backend/staticfiles' \
  --exclude='./.agent-logs' \
  --exclude='./.agent-tmp' \
  --exclude='./.git' \
  -C "$parent" -czf "$out" "$name"

echo "==> Re-extracting finished archive elsewhere and repeating acceptance"
"$ROOT/scripts/agent-archive-acceptance.sh" "$out"

echo "READY_BUNDLE=$out"

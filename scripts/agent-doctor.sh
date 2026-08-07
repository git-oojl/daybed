#!/usr/bin/env bash
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

fail=0
pass() { printf 'OK   %s\n' "$*"; }
warn() { printf 'WARN %s\n' "$*"; }
bad() { printf 'FAIL %s\n' "$*"; fail=1; }

os="$(uname -s 2>/dev/null || true)"
arch="$(uname -m 2>/dev/null || true)"
[[ "$os" == "Linux" ]] && pass "OS: Linux" || bad "OS is $os; sandbox profile targets Linux"
[[ "$arch" == "x86_64" ]] && pass "arch: x86_64" || bad "architecture is $arch; vendor payload targets x86_64"
if [[ -r /etc/os-release ]]; then
  . /etc/os-release
  pass "distribution: ${PRETTY_NAME:-unknown}"
fi

if command -v uv >/dev/null 2>&1; then
  pass "uv: $(uv --version | awk '{print $2}')"
else
  bad "uv is not installed"
fi

if py="$(select_python 2>/dev/null)"; then
  pyver="$($py -c 'import platform; print(platform.python_version())')"
  [[ "$pyver" == 3.12.* ]] && pass "backend Python: $pyver ($py)" || bad "backend Python is $pyver; expected 3.12.x"
else
  bad "no Python 3.12 runtime found; target sandbox system Python may be 3.13, so include .vendor/python"
fi

if command -v node >/dev/null 2>&1; then
  nodever="$(node --version | sed 's/^v//')"
  if version_ge "$nodever" "22.12.0"; then pass "Node: $nodever"; else bad "Node $nodever is too old for locked Vite 8 (need >=22.12 on Node 22)"; fi
else
  bad "Node is not installed"
fi

if command -v npm >/dev/null 2>&1; then pass "npm: $(npm --version)"; else bad "npm is not installed"; fi

[[ -f "$ROOT/backend/uv.lock" ]] && pass "backend lockfile present" || bad "backend/uv.lock missing"
[[ -f "$ROOT/frontend/package-lock.json" ]] && pass "frontend lockfile present" || bad "frontend/package-lock.json missing"
[[ -f "$ROOT/backend/.env" ]] && pass "backend .env present" || warn "backend .env missing (bootstrap will copy example)"
[[ -f "$ROOT/frontend/.env" ]] && pass "frontend .env present" || warn "frontend .env missing (bootstrap will copy example)"
[[ -d "$UV_CACHE_DIR" ]] && pass "vendored uv cache present" || warn "vendored uv cache missing; offline bootstrap cannot install backend dependencies"
[[ -d "$NPM_CACHE_DIR" ]] && pass "vendored npm cache present" || warn "vendored npm cache missing; offline bootstrap cannot install frontend dependencies"
[[ -d "$PLAYWRIGHT_BROWSERS_DIR" ]] && pass "vendored Playwright browser payload present" || warn "vendored Playwright browsers missing; make smoke cannot launch Chromium"

if [[ -d "$VENDOR_DIR" ]]; then
  absolute_vendor_links=0
  broken_vendor_links=0
  while IFS= read -r -d '' link; do
    target="$(readlink "$link")"
    [[ "$target" == /* ]] && absolute_vendor_links=$((absolute_vendor_links + 1))
    [[ -e "$link" ]] || broken_vendor_links=$((broken_vendor_links + 1))
  done < <(find "$VENDOR_DIR" -type l -print0)
  [[ "$absolute_vendor_links" -eq 0 ]] && pass "vendor symlinks are relative" || bad "$absolute_vendor_links absolute vendor symlink(s) make the bundle path-dependent"
  [[ "$broken_vendor_links" -eq 0 ]] && pass "vendor symlinks resolve" || bad "$broken_vendor_links broken vendor symlink(s)"
fi

if [[ -d "$ROOT/backend/.venv" ]]; then pass "backend .venv present"; else warn "backend .venv missing"; fi
if [[ -d "$ROOT/frontend/node_modules" ]]; then pass "frontend node_modules present"; else warn "frontend node_modules missing"; fi

if (( fail )); then
  echo
  echo "Doctor found blocking issues. For an offline sandbox, build/upload the fat bundle with scripts/build-sandbox-bundle.sh."
  exit 1
fi

echo
echo "Doctor found no blocking runtime mismatch."

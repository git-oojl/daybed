#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

if [[ ! -x "$ROOT/backend/.venv/bin/python" || ! -d "$ROOT/frontend/node_modules" ]]; then
  echo "Dependencies are not bootstrapped. Run make bootstrap first." >&2
  exit 2
fi
require_command setsid

cleanup() {
  local code=$?
  trap - INT TERM EXIT
  [[ -n "${backend_pid:-}" ]] && kill -TERM -- "-$backend_pid" 2>/dev/null || true
  [[ -n "${frontend_pid:-}" ]] && kill -TERM -- "-$frontend_pid" 2>/dev/null || true
  sleep 0.2
  [[ -n "${backend_pid:-}" ]] && kill -KILL -- "-$backend_pid" 2>/dev/null || true
  [[ -n "${frontend_pid:-}" ]] && kill -KILL -- "-$frontend_pid" 2>/dev/null || true
  wait "${backend_pid:-}" 2>/dev/null || true
  wait "${frontend_pid:-}" 2>/dev/null || true
  exit "$code"
}
trap cleanup INT TERM EXIT

setsid bash -c '
  cd "$1/backend"
  exec "$1/backend/.venv/bin/python" manage.py runserver 0.0.0.0:8000
' _ "$ROOT" &
backend_pid=$!

setsid bash -c '
  cd "$1/frontend"
  exec npm run dev -- --host 0.0.0.0 --port 5173
' _ "$ROOT" &
frontend_pid=$!

printf 'Backend PID %s -> http://127.0.0.1:8000\n' "$backend_pid"
printf 'Frontend PID %s -> http://127.0.0.1:5173\n' "$frontend_pid"
wait -n "$backend_pid" "$frontend_pid"

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

mkdir -p "$ROOT/.agent-logs"
backend_log="$ROOT/.agent-logs/backend-smoke.log"
frontend_log="$ROOT/.agent-logs/frontend-smoke.log"
: > "$backend_log"
: > "$frontend_log"

cleanup() {
  local code=$?
  trap - INT TERM EXIT
  if [[ -n "${backend_pid:-}" ]]; then
    kill -TERM -- "-$backend_pid" 2>/dev/null || true
  fi
  if [[ -n "${frontend_pid:-}" ]]; then
    kill -TERM -- "-$frontend_pid" 2>/dev/null || true
  fi
  sleep 0.2
  if [[ -n "${backend_pid:-}" ]]; then
    kill -KILL -- "-$backend_pid" 2>/dev/null || true
  fi
  if [[ -n "${frontend_pid:-}" ]]; then
    kill -KILL -- "-$frontend_pid" 2>/dev/null || true
  fi
  wait "${backend_pid:-}" 2>/dev/null || true
  wait "${frontend_pid:-}" 2>/dev/null || true
  exit "$code"
}
trap cleanup INT TERM EXIT

setsid bash -c '
  cd "$1/backend"
  exec "$1/backend/.venv/bin/python" manage.py runserver 127.0.0.1:8000 --noreload
' _ "$ROOT" >"$backend_log" 2>&1 &
backend_pid=$!

setsid bash -c '
  cd "$1/frontend"
  exec npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
' _ "$ROOT" >"$frontend_log" 2>&1 &
frontend_pid=$!

wait_url() {
  local url="$1" name="$2"
  local i
  for i in $(seq 1 80); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      printf '%s ready: %s\n' "$name" "$url"
      return 0
    fi
    if ! kill -0 "$backend_pid" 2>/dev/null || ! kill -0 "$frontend_pid" 2>/dev/null; then
      break
    fi
    sleep 0.25
  done
  echo "$name did not become ready: $url" >&2
  echo "--- backend log ---" >&2
  tail -80 "$backend_log" >&2 || true
  echo "--- frontend log ---" >&2
  tail -80 "$frontend_log" >&2 || true
  return 1
}

wait_url "http://127.0.0.1:8000/api/health/" "Django"
wait_url "http://127.0.0.1:5173/" "Vite"

"$ROOT/scripts/agent-browser-check.sh"
(
  cd "$ROOT/frontend"
  DAYBED_SMOKE_BASE_URL="http://127.0.0.1:5173" npm run test:smoke
)

echo "Browser smoke passed. Logs: $ROOT/.agent-logs"

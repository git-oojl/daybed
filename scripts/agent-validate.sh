#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/agent-common.sh"

if [[ ! -x "$ROOT/backend/.venv/bin/python" ]]; then
  echo "Backend environment missing. Run make bootstrap first." >&2
  exit 2
fi
if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
  echo "Frontend dependencies missing. Run make bootstrap first." >&2
  exit 2
fi

# Do not depend on ownership/state of the host's shared /tmp. Pytest itself
# protects against foreign-owned predictable temp directories; use a disposable
# project-local temp root so cold extractions behave identically everywhere.
PYTEST_TEMP_ROOT="$ROOT/.agent-tmp/pytest"
rm -rf "$PYTEST_TEMP_ROOT"
mkdir -p "$PYTEST_TEMP_ROOT"

(
  cd "$ROOT/backend"
  "$ROOT/backend/.venv/bin/python" manage.py check
  "$ROOT/backend/.venv/bin/python" manage.py makemigrations --check --dry-run
  "$ROOT/backend/.venv/bin/python" manage.py migrate --check
  TMPDIR="$PYTEST_TEMP_ROOT" PYTEST_DEBUG_TEMPROOT="$PYTEST_TEMP_ROOT" \
    "$ROOT/backend/.venv/bin/python" -m pytest -q
)
(
  cd "$ROOT/frontend"
  npm run lint
  npm run build
  npm test
)

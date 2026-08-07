#!/usr/bin/env bash
# Restore the hermetic .vendor payload from a full Daybed sandbox bundle.
# The project clone and archive may live anywhere and may have any directory name.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FORCE=0

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/restore-vendor.sh [--force] /path/to/daybed-*-playwright-ready.tar.gz

Restores only .vendor from a full Daybed sandbox archive into this checkout.
The archive's top-level project directory name does not need to match this clone.

Safety checks:
  - rejects unsafe archive member paths;
  - requires exactly one .vendor payload;
  - compares runtime/dependency contract files with the current checkout;
  - refuses to overwrite an existing .vendor unless --force is supplied;
  - repairs relocatable vendor symlinks;
  - runs the runtime doctor after installation;
  - rolls back an existing .vendor if installation/doctor fails.
USAGE
}

if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
  shift
fi
if [[ $# -ne 1 ]]; then
  usage >&2
  exit 2
fi

command -v tar >/dev/null 2>&1 || { echo "Missing required command: tar" >&2; exit 2; }
command -v gzip >/dev/null 2>&1 || { echo "Missing required command: gzip" >&2; exit 2; }
command -v realpath >/dev/null 2>&1 || { echo "Missing required command: realpath" >&2; exit 2; }
command -v sha256sum >/dev/null 2>&1 || { echo "Missing required command: sha256sum" >&2; exit 2; }

ARCHIVE="$(realpath -e "$1" 2>/dev/null || true)"
[[ -n "$ARCHIVE" && -f "$ARCHIVE" ]] || { echo "Archive not found: $1" >&2; exit 2; }

echo "==> Project root: $ROOT"
echo "==> Environment archive: $ARCHIVE"

echo "==> Verifying gzip stream"
gzip -t "$ARCHIVE"

# Keep temporary data on the same filesystem as the checkout so replacing
# .vendor is a rename rather than a cross-filesystem copy where possible.
TMP="$(mktemp -d "$ROOT/.vendor-restore.XXXXXX")"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT INT TERM
LIST="$TMP/archive-members.txt"
VENDOR_LIST="$TMP/vendor-members.txt"
tar -tzf "$ARCHIVE" > "$LIST"

# Reject absolute paths and parent traversal before extracting anything.
unsafe=0
while IFS= read -r raw; do
  norm="${raw#./}"
  [[ -z "$norm" ]] && continue
  if [[ "$raw" == /* || "$norm" == ".." || "$norm" == ../* || "$norm" == */../* || "$norm" == */.. ]]; then
    echo "Unsafe archive member: $raw" >&2
    unsafe=1
  fi
done < "$LIST"
(( unsafe == 0 )) || { echo "Archive rejected because it contains unsafe paths." >&2; exit 3; }

# A supported anchor contains either .vendor directly or exactly one
# <arbitrary-project-name>/.vendor tree.
mapfile -t prefixes < <(
  awk '
    {
      n=$0; sub(/^\.\//, "", n)
      if (n == ".vendor" || index(n, ".vendor/") == 1) print "."
      else {
        split(n, p, "/")
        if (p[2] == ".vendor") print p[1]
      }
    }
  ' "$LIST" | sort -u
)

if [[ ${#prefixes[@]} -ne 1 ]]; then
  echo "Expected exactly one Daybed .vendor payload; found ${#prefixes[@]}." >&2
  printf '  prefix: %s\n' "${prefixes[@]:-<none>}" >&2
  exit 3
fi
PREFIX="${prefixes[0]}"

: > "$VENDOR_LIST"
while IFS= read -r raw; do
  norm="${raw#./}"
  if [[ "$PREFIX" == "." ]]; then
    [[ "$norm" == ".vendor" || "$norm" == .vendor/* ]] && printf '%s\n' "$raw" >> "$VENDOR_LIST"
  else
    [[ "$norm" == "$PREFIX/.vendor" || "$norm" == "$PREFIX/.vendor/"* ]] && printf '%s\n' "$raw" >> "$VENDOR_LIST"
  fi
done < "$LIST"
[[ -s "$VENDOR_LIST" ]] || { echo "Archive contains no extractable .vendor members." >&2; exit 3; }

archive_member_for() {
  local rel="$1" raw norm expected
  if [[ "$PREFIX" == "." ]]; then expected="$rel"; else expected="$PREFIX/$rel"; fi
  while IFS= read -r raw; do
    norm="${raw#./}"
    if [[ "$norm" == "$expected" ]]; then
      printf '%s\n' "$raw"
      return 0
    fi
  done < "$LIST"
  return 1
}

# The binary cache is safe to restore only when it matches the current clone's
# runtime and dependency contract. This catches using an old anchor after a
# lockfile/runtime change.
compat_fail=0
for rel in \
  agent/runtime.env \
  backend/pyproject.toml \
  backend/uv.lock \
  frontend/package.json \
  frontend/package-lock.json; do
  current="$ROOT/$rel"
  member="$(archive_member_for "$rel" || true)"
  if [[ ! -f "$current" ]]; then
    echo "Compatibility check failed: current checkout is missing $rel" >&2
    compat_fail=1
    continue
  fi
  if [[ -z "$member" ]]; then
    echo "Compatibility check failed: archive is missing $rel" >&2
    compat_fail=1
    continue
  fi
  archived="$TMP/$(basename "$rel").archive"
  tar -xOzf "$ARCHIVE" "$member" > "$archived"
  if ! cmp -s "$current" "$archived"; then
    echo "Compatibility mismatch: $rel" >&2
    printf '  checkout: %s\n' "$(sha256sum "$current" | awk '{print $1}')" >&2
    printf '  archive:  %s\n' "$(sha256sum "$archived" | awk '{print $1}')" >&2
    compat_fail=1
  fi
done

if (( compat_fail )); then
  if (( FORCE )); then
    echo "WARN: --force supplied; restoring a vendor payload whose contract differs from this checkout." >&2
  else
    cat >&2 <<'MSG'
Vendor restore refused because the environment anchor does not match this checkout.
If dependencies/runtime changed, rebuild the environment with:
  bash scripts/build-sandbox-bundle.sh
Use --force only when you intentionally accept this mismatch.
MSG
    exit 4
  fi
fi

if [[ -e "$ROOT/.vendor" || -L "$ROOT/.vendor" ]]; then
  if (( ! FORCE )); then
    echo "Destination already has .vendor. Refusing to overwrite it." >&2
    echo "Use --force only if you intentionally want to replace the current vendor payload." >&2
    exit 5
  fi
fi

echo "==> Extracting .vendor into staging area"
mkdir -p "$TMP/extract"
tar -xzf "$ARCHIVE" -C "$TMP/extract" -T "$VENDOR_LIST"
if [[ "$PREFIX" == "." ]]; then
  STAGED_VENDOR="$TMP/extract/.vendor"
else
  STAGED_VENDOR="$TMP/extract/$PREFIX/.vendor"
fi
[[ -d "$STAGED_VENDOR" ]] || { echo "Staged .vendor directory was not created." >&2; exit 6; }

# Basic completeness checks before touching an existing payload.
for required in \
  bin/uv \
  node/bin/node \
  python \
  uv-cache \
  npm-cache \
  playwright-browsers; do
  [[ -e "$STAGED_VENDOR/$required" || -L "$STAGED_VENDOR/$required" ]] || {
    echo "Incomplete vendor payload: missing .vendor/$required" >&2
    exit 6
  }
done

OLD_VENDOR=""
rollback() {
  local code=$?
  trap - EXIT INT TERM
  if [[ -n "$OLD_VENDOR" && -e "$OLD_VENDOR" ]]; then
    rm -rf "$ROOT/.vendor"
    mv "$OLD_VENDOR" "$ROOT/.vendor"
    echo "Rolled back the previous .vendor after restore failure." >&2
  fi
  rm -rf "$TMP"
  exit "$code"
}
trap rollback EXIT INT TERM

if [[ -e "$ROOT/.vendor" || -L "$ROOT/.vendor" ]]; then
  OLD_VENDOR="$TMP/previous-vendor"
  mv "$ROOT/.vendor" "$OLD_VENDOR"
fi
mv "$STAGED_VENDOR" "$ROOT/.vendor"

echo "==> Repairing vendor symlinks for this checkout location"
"$ROOT/scripts/agent-relativize-vendor-links.sh"

echo "==> Running runtime doctor"
"$ROOT/scripts/agent-doctor.sh"

# Commit the replacement: discard the old copy only after repair + doctor pass.
if [[ -n "$OLD_VENDOR" ]]; then
  rm -rf "$OLD_VENDOR"
  OLD_VENDOR=""
fi
trap cleanup EXIT INT TERM

echo
echo "Vendor restore complete. Next commands:"
echo "  make bootstrap"
echo "  make validate"
echo "  make smoke"

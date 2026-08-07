#!/usr/bin/env bash
# Cold-extract a finished bundle into a random path and prove that it is
# relocatable, offline-bootstrappable, migration-clean, testable, and browser-ready.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /absolute/path/to/bundle.tar.gz" >&2
  exit 2
fi

ARCHIVE="$(realpath "$1")"
[[ -f "$ARCHIVE" ]] || { echo "Archive not found: $ARCHIVE" >&2; exit 2; }

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT INT TERM
mkdir -p "$TMP/extract" "$TMP/home"

echo "==> Cold extracting archive into random path: $TMP/extract"
tar -xzf "$ARCHIVE" -C "$TMP/extract"

mapfile -t roots < <(find "$TMP/extract" -mindepth 1 -maxdepth 1 -type d -print)
if [[ ${#roots[@]} -ne 1 ]]; then
  echo "Expected exactly one top-level project directory in archive; found ${#roots[@]}." >&2
  printf '  %s\n' "${roots[@]}" >&2
  exit 3
fi
PROJECT="${roots[0]}"

[[ -f "$PROJECT/Makefile" && -d "$PROJECT/scripts" && -d "$PROJECT/.vendor" ]] || {
  echo "Extracted top-level directory does not look like the Daybed project: $PROJECT" >&2
  exit 3
}

absolute_links=0
broken_links=0
while IFS= read -r -d '' link; do
  target="$(readlink "$link")"
  if [[ "$target" == /* ]]; then
    echo "Absolute vendor symlink in packaged artifact: $link -> $target" >&2
    absolute_links=$((absolute_links + 1))
  fi
  if [[ ! -e "$link" ]]; then
    echo "Broken vendor symlink in packaged artifact: $link -> $target" >&2
    broken_links=$((broken_links + 1))
  fi
done < <(find "$PROJECT/.vendor" -type l -print0)

if (( absolute_links || broken_links )); then
  echo "Archive rejected: absolute vendor symlinks=$absolute_links, broken vendor symlinks=$broken_links" >&2
  exit 4
fi

echo "==> Vendor symlinks are relocatable"

echo "==> Running complete cold acceptance with stripped environment"
env -i \
  HOME="$TMP/home" \
  USER="daybed-acceptance" \
  LANG=C.UTF-8 \
  LC_ALL=C.UTF-8 \
  PATH=/usr/bin:/bin \
  bash --noprofile --norc -c '
    set -euo pipefail
    cd "$1"
    echo "========== DOCTOR =========="
    make doctor
    echo "========== BOOTSTRAP =========="
    make bootstrap
    echo "========== VALIDATE + MIGRATION DRIFT =========="
    make validate
    echo "========== CHROMIUM =========="
    make browser-check
    echo "========== LIVE BROWSER SMOKE =========="
    make smoke
  ' _ "$PROJECT"

echo "Archive cold acceptance passed: $ARCHIVE"

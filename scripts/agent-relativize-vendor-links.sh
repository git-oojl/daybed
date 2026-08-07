#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_DIR="$ROOT/.vendor"

[[ -d "$VENDOR_DIR" ]] || { echo "Missing vendor directory: $VENDOR_DIR" >&2; exit 2; }
command -v realpath >/dev/null 2>&1 || { echo "Missing required command: realpath" >&2; exit 2; }

changed=0
while IFS= read -r -d '' link; do
  target="$(readlink "$link")"
  candidate=""

  # Current-root absolute links can be made relative directly. Old bundles may
  # contain absolute links from ANY previous workspace; preserve only the
  # suffix below /.vendor/ and point it at this extraction's vendor directory.
  if [[ "$target" == "$ROOT/"* ]]; then
    candidate="$target"
  elif [[ "$target" == */.vendor/* ]]; then
    suffix="${target#*/.vendor/}"
    candidate="$VENDOR_DIR/$suffix"
  fi

  if [[ -n "$candidate" ]]; then
    relative="$(realpath -m --relative-to="$(dirname "$link")" "$candidate")"
    ln -snf "$relative" "$link"
    changed=$((changed + 1))
  fi
done < <(find "$VENDOR_DIR" -type l -print0)

bad=0
while IFS= read -r -d '' link; do
  target="$(readlink "$link")"
  if [[ "$target" == /* ]]; then
    echo "Absolute vendor symlink remains: $link -> $target" >&2
    bad=1
  elif [[ ! -e "$link" ]]; then
    echo "Broken vendor symlink remains: $link -> $target" >&2
    bad=1
  fi
done < <(find "$VENDOR_DIR" -type l -print0)

(( bad == 0 )) || exit 3
echo "Relativized $changed vendor symlink(s); no absolute or broken vendor symlinks remain."

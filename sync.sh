#!/usr/bin/env bash
set -euo pipefail

root="/Users/wangzheyu/Downloads/Github/seedance2.0-skill"
src="$root/skills"

targets=(
  "$root/.claude/skills"
  "$root/.trae/skills"
  "$root/.agent/skills"
)

if [ ! -d "$src" ]; then
  echo "Source directory not found: $src"
  exit 1
fi

for dst in "${targets[@]}"; do
  echo "Syncing to: $dst"
  mkdir -p "$dst"

  for dir in "$src"/*/; do
    [ -d "$dir" ] || continue
    name="$(basename "$dir")"
    ln -sfn "$dir" "$dst/$name"
    echo "  linked: $name"
  done
done

echo "Done."
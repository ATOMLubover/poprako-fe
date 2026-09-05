#!/usr/bin/env sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

command -v bun >/dev/null 2>&1 || {
    echo "Bun 1.3 is required to audit dependencies." >&2
    exit 127
}

cd "$project_root"

bun install --frozen-lockfile
bun audit --prod --audit-level high

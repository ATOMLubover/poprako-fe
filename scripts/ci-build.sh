#!/usr/bin/env sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

run_bun() {
    command -v bun >/dev/null 2>&1 || {
        echo "Bun 1.3 is required to build the application." >&2
        exit 127
    }

    bun "$@"
}

cd "$project_root"

run_bun install --frozen-lockfile
run_bun run build

#!/usr/bin/env sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

run_bun() {
    command -v bun >/dev/null 2>&1 || {
        echo "Bun 1.3 is required to run CI checks." >&2
        exit 127
    }

    bun "$@"
}

cd "$project_root"

run_bun install --frozen-lockfile
run_bun run lint
run_bun run test:unit
run_bun run build
sh scripts/test-deployment.sh
run_bun run build-storybook

if [ -n "${LINE_LENGTH_BASE_SHA:-}" ]; then
    sh scripts/ci-line-length.sh "$LINE_LENGTH_BASE_SHA"
fi

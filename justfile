default:
    just --list

shad component:
    bunx shadcn@latest add {{component}}

check:
    sh scripts/ci-check.sh

test:
    bun run test:unit

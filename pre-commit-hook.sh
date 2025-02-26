#!/bin/bash

set -eo pipefail

cp -r ./docs ./packages/e-fatura
cp ./README.md ./packages/e-fatura

pnpm -r run generate:readme
pnpm -r run generate:docker-readme

git add packages/e-fatura/docs \
        packages/e-fatura/README.md \
        packages/e-fatura-cli/*.md

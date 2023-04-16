#!/usr/bin/env bash

set -eo pipefail

PACKAGE_VERSION="$(node -p 'require("./package.json").version')"

yarn build
yarn publish --new-version "$PACKAGE_VERSION"

#!/usr/bin/env bash

PACKAGE_VERSION="$(node -p 'require("./package.json").version')"

yarn test
yarn build
yarn publish --new-version "$PACKAGE_VERSION"

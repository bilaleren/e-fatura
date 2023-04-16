#!/usr/bin/env bash

set -eo pipefail

if [ "$1" == "build" ]; then
  yarn build
  docker image rm e-fatura:alpine || echo
  docker build --no-cache -t e-fatura:alpine -f ./Dockerfile .
elif [ "$1" == "up" ]; then
  docker container run --rm -v "$(pwd)/invoice-data:/usr/src/apps/e-fatura/invoice-data" e-fatura:alpine
else
  echo "command $1 not found."
  exit 1
fi

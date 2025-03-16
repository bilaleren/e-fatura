#!/bin/bash

set -eo pipefail

install_hook() {
  # shellcheck disable=SC2155
  local hook_path="$(pwd)/$1-hook.sh"

  if [ -f "$hook_path" ] && [ ! -L ".git/hooks/$1" ]; then
    ln -sf "$hook_path" ".git/hooks/$1"
  fi
}

install_hook "pre-commit"

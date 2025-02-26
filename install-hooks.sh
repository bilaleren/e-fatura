#!/bin/bash

set -eo pipefail

ln -sf $PWD/pre-commit-hook.sh .git/hooks/pre-commit

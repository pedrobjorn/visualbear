#!/usr/bin/env bash
# Prettier 2.x needs the Node 10 toolchain (same as gulp). Run the local
# prettier binary with the .nvmrc version. Delegates all args to prettier.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
NODE_VERSION="$(tr -d '[:space:]' < "$ROOT/.nvmrc")"

if [ ! -s "$NVM_DIR/nvm-exec" ]; then
  echo "nvm is not installed at $NVM_DIR" >&2
  exit 1
fi

export NVM_DIR
export NODE_VERSION

exec "$NVM_DIR/nvm-exec" "$ROOT/node_modules/.bin/prettier" "$@"

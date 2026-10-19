#!/usr/bin/env bash
# Gulp 3 needs Node 10. Always run the local gulp binary with the .nvmrc version.
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

exec "$NVM_DIR/nvm-exec" "$ROOT/node_modules/.bin/gulp" "$@"

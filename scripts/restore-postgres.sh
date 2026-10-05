#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${1:?Usage: scripts/restore-postgres.sh <backup.dump>}"

pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --dbname="$DATABASE_URL" \
  "$1"

echo "Restore completed from: $1"

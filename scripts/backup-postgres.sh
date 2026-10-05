#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="$BACKUP_DIR/stockflow-$TIMESTAMP.dump"

find "$BACKUP_DIR" -type f -name 'stockflow-*.dump' -mtime +"$RETENTION_DAYS" -delete

echo "Backup created: $BACKUP_DIR/stockflow-$TIMESTAMP.dump"

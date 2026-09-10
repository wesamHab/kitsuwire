#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/kitsuwire}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DAY_DIR="$BACKUP_ROOT/$STAMP"

case "$RETENTION_DAYS" in
  ''|*[!0-9]*) echo "BACKUP_RETENTION_DAYS must be a positive integer." >&2; exit 1;;
esac

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

umask 077
mkdir -p "$DAY_DIR"

echo "[KitsuWire] Backing up PostgreSQL..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
  pg_dump -U kitsuwire -d kitsuwire --format=custom --no-owner --no-privileges \
  > "$DAY_DIR/kitsuwire-postgres.dump"

echo "[KitsuWire] Backing up media volume..."
docker run --rm \
  -v kitsuwire_media_data:/data:ro \
  -v "$DAY_DIR":/backup \
  alpine:3.22 sh -c 'cd /data && tar -czf /backup/kitsuwire-media.tar.gz .'

printf '%s\n' "$STAMP" > "$DAY_DIR/backup-created-utc.txt"
sha256sum "$DAY_DIR/kitsuwire-postgres.dump" "$DAY_DIR/kitsuwire-media.tar.gz" > "$DAY_DIR/SHA256SUMS"

if [ -n "${OFFSITE_BACKUP_DIR:-}" ]; then
  echo "[KitsuWire] Copying backup to off-site directory..."
  mkdir -p "$OFFSITE_BACKUP_DIR"
  cp -a "$DAY_DIR" "$OFFSITE_BACKUP_DIR/"
fi

echo "[KitsuWire] Removing local backups older than $RETENTION_DAYS days..."
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_DAYS" -exec rm -rf {} +

echo "[KitsuWire] Backup complete: $DAY_DIR"

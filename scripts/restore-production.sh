#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"
RESTORE_FROM="${RESTORE_FROM:-}"

if [ "$CONFIRM_RESTORE" != "YES" ] 2>/dev/null; then
  echo "Restore is destructive. Run with CONFIRM_RESTORE=YES and RESTORE_FROM=/path/to/backup." >&2
  exit 1
fi

if [ -z "$RESTORE_FROM" ] || [ ! -d "$RESTORE_FROM" ]; then
  echo "RESTORE_FROM must point to a backup directory." >&2
  exit 1
fi

DB_DUMP="$RESTORE_FROM/kitsuwire-postgres.dump"
MEDIA_ARCHIVE="$RESTORE_FROM/kitsuwire-media.tar.gz"
[ -f "$DB_DUMP" ] || { echo "Missing $DB_DUMP" >&2; exit 1; }
[ -f "$MEDIA_ARCHIVE" ] || { echo "Missing $MEDIA_ARCHIVE" >&2; exit 1; }

if [ -f "$RESTORE_FROM/SHA256SUMS" ]; then
  echo "[KitsuWire] Verifying backup checksums..."
  (cd "$RESTORE_FROM" && sha256sum -c SHA256SUMS)
fi

echo "[KitsuWire] Stopping web service during restore..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop web || true
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db

echo "[KitsuWire] Restoring PostgreSQL..."
cat "$DB_DUMP" | docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
  pg_restore -U kitsuwire -d kitsuwire --clean --if-exists --no-owner --no-privileges

echo "[KitsuWire] Restoring media..."
docker run --rm \
  -v kitsuwire_media_data:/data \
  -v "$RESTORE_FROM":/restore:ro \
  alpine:3.22 sh -c 'find /data -mindepth 1 -maxdepth 1 -exec rm -rf {} + && tar -xzf /restore/kitsuwire-media.tar.gz -C /data'

echo "[KitsuWire] Starting application..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d web

echo "[KitsuWire] Restore complete. Verify https://kitsuwire.com and the admin dashboard immediately."

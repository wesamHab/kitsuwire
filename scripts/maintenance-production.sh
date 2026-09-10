#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

echo "[KitsuWire] Pruning expired analytics events..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm migrate node scripts/prune-analytics.mjs

echo "[KitsuWire] Running backup..."
ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" "$ROOT_DIR/scripts/backup-production.sh"

echo "[KitsuWire] Checking application health..."
curl -fsS --max-time 10 http://127.0.0.1:3001/api/health >/dev/null

echo "[KitsuWire] Maintenance completed successfully."

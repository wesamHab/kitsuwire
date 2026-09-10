#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.production.example and fill the production secrets first." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required." >&2
  exit 1
fi

echo "[KitsuWire] Validating production compose configuration..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null

echo "[KitsuWire] Building and starting the stack..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "[KitsuWire] Waiting for the local web endpoint..."
attempt=0
until curl -fsS --max-time 5 http://127.0.0.1:3001/ >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "KitsuWire did not become healthy in time." >&2
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps >&2 || true
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=80 web >&2 || true
    exit 1
  fi
  sleep 2
done

echo "[KitsuWire] Deployment healthy at http://127.0.0.1:3001"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

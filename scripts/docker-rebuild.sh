#!/bin/bash
# docker-rebuild.sh - Rebuild and restart vintage-audio Docker services
# Usage: ./scripts/docker-rebuild.sh [service]
# Example: ./scripts/docker-rebuild.sh backend

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}/backend"

SERVICE="$1"

echo "Rebuilding vintage-audio services..."

if [[ -n "$SERVICE" ]]; then
    echo "Target service: $SERVICE"
    docker compose build --no-cache "$SERVICE"
    docker compose up -d "$SERVICE"
else
    echo "Rebuilding all services..."
    docker compose build --no-cache
    docker compose up -d
fi

echo ""
echo "Rebuild complete."
docker compose ps

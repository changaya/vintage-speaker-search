#!/bin/bash
# docker-up.sh - Start vintage-audio Docker services
# Usage: ./scripts/docker-up.sh [--detach]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}/backend"

DETACH_FLAG=""
if [[ "$1" == "--detach" || "$1" == "-d" ]]; then
    DETACH_FLAG="-d"
fi

echo "Starting vintage-audio services..."
docker compose up $DETACH_FLAG

if [[ -n "$DETACH_FLAG" ]]; then
    echo ""
    echo "Services started in background."
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:4000"
    echo ""
    docker compose ps
fi

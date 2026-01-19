#!/bin/bash
# docker-ps.sh - Show vintage-audio Docker service status
# Usage: ./scripts/docker-ps.sh [--logs]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}/backend"

echo "=== Vintage Audio Docker Status ==="
echo ""

docker compose ps

if [[ "$1" == "--logs" || "$1" == "-l" ]]; then
    echo ""
    echo "=== Recent Logs ==="
    docker compose logs --tail=20
fi

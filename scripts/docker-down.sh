#!/bin/bash
# docker-down.sh - Stop vintage-audio Docker services
# Usage: ./scripts/docker-down.sh [--volumes]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}/backend"

VOLUME_FLAG=""
if [[ "$1" == "--volumes" || "$1" == "-v" ]]; then
    VOLUME_FLAG="-v"
    echo "WARNING: This will also remove volumes (database data)!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

echo "Stopping vintage-audio services..."
docker compose down $VOLUME_FLAG
echo "Done."

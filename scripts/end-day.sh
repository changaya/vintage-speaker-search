#!/bin/bash
# end-day.sh - Daily cleanup script for vintage-audio project
# Usage: ./scripts/end-day.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/vintage_audio_${TIMESTAMP}.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Vintage Audio - End of Day Cleanup ===${NC}"
echo ""

# Step 1: Check if containers are running
echo -e "${YELLOW}[1/3] Checking Docker containers...${NC}"
cd "${PROJECT_ROOT}/backend"

if ! docker compose ps --quiet 2>/dev/null | grep -q .; then
    echo -e "${RED}No containers running. Nothing to do.${NC}"
    exit 0
fi

docker compose ps

# Step 2: MySQL Backup
echo ""
echo -e "${YELLOW}[2/3] Creating MySQL backup...${NC}"
mkdir -p "${BACKUP_DIR}"

if docker compose exec -T db mysqldump -u vintage_user -pvintage_pass vintage_audio > "${BACKUP_FILE}" 2>/dev/null; then
    FILESIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
    echo -e "${GREEN}Backup created: ${BACKUP_FILE} (${FILESIZE})${NC}"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi

# Step 3: Stop Docker containers
echo ""
echo -e "${YELLOW}[3/3] Stopping Docker containers...${NC}"
docker compose down

echo ""
echo -e "${GREEN}=== End of Day cleanup complete ===${NC}"
echo -e "Backup location: ${BACKUP_FILE}"

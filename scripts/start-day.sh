#!/bin/bash
# start-day.sh - Daily startup script for vintage-audio project
# Usage: ./scripts/start-day.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Vintage Audio - Start of Day ===${NC}"
echo ""

# Step 1: Check if containers are already running
echo -e "${YELLOW}[1/4] Checking Docker status...${NC}"
cd "${PROJECT_ROOT}/backend"

if docker compose ps --quiet 2>/dev/null | grep -q .; then
    echo -e "${CYAN}Containers already running:${NC}"
    docker compose ps
    echo ""
    echo -e "${GREEN}=== Already running! Ready to work ===${NC}"
    exit 0
fi

# Step 2: Start Docker containers
echo -e "${YELLOW}[2/4] Starting Docker containers...${NC}"
docker compose up -d

# Step 3: Wait for services to be healthy
echo ""
echo -e "${YELLOW}[3/4] Waiting for services to be ready...${NC}"

# Wait for MySQL to be healthy (max 30 seconds)
echo -n "  Waiting for MySQL..."
for i in {1..30}; do
    if docker compose exec -T db mysqladmin ping -h localhost -u vintage_user -pvintage_pass --silent 2>/dev/null; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e " ${RED}Timeout${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done

# Wait for backend API to respond (max 30 seconds)
echo -n "  Waiting for Backend API..."
for i in {1..30}; do
    if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e " ${YELLOW}Timeout (may still be starting)${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

# Wait for frontend to respond (max 30 seconds)
echo -n "  Waiting for Frontend..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e " ${YELLOW}Timeout (may still be starting)${NC}"
        break
    fi
    sleep 1
    echo -n "."
done

# Step 4: Show status
echo ""
echo -e "${YELLOW}[4/4] Container status:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}=== Start of Day complete ===${NC}"
echo -e "Frontend: ${CYAN}http://localhost:3000${NC}"
echo -e "Backend:  ${CYAN}http://localhost:4000${NC}"
echo -e "Admin:    ${CYAN}http://localhost:3000/admin${NC}"

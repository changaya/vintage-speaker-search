#!/bin/bash
# worktree-list.sh - List all worktrees with status and ports
# Usage: ./scripts/worktree-list.sh

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🌿 Git Worktrees for vintage-audio"
echo "=================================="
echo ""

# Get all worktrees
git worktree list --porcelain | while read line; do
    if [[ $line == worktree* ]]; then
        WORKTREE_PATH="${line#worktree }"

        # Read the next lines for branch info
        read head_line
        read branch_line

        BRANCH="${branch_line#branch refs/heads/}"

        # Check for .env.branch file
        if [ -f "$WORKTREE_PATH/backend/.env.branch" ]; then
            source "$WORKTREE_PATH/backend/.env.branch"
            PORTS="FE:$FRONTEND_PORT BE:$BACKEND_PORT DB:$DB_PORT"
        else
            PORTS="(default: FE:3000 BE:4000 DB:3306)"
        fi

        # Check Docker status
        if [ -f "$WORKTREE_PATH/backend/docker-compose.yml" ]; then
            cd "$WORKTREE_PATH/backend" 2>/dev/null
            RUNNING=$(docker compose ps --quiet 2>/dev/null | wc -l | tr -d ' ')
            if [ "$RUNNING" -gt 0 ]; then
                DOCKER_STATUS="🟢 Running ($RUNNING containers)"
            else
                DOCKER_STATUS="⚪ Stopped"
            fi
        else
            DOCKER_STATUS="❓ No docker-compose"
        fi

        echo "📁 $WORKTREE_PATH"
        echo "   Branch: $BRANCH"
        echo "   Ports:  $PORTS"
        echo "   Docker: $DOCKER_STATUS"
        echo ""
    fi
done

echo "=================================="
echo "Commands:"
echo "  Create:  ./scripts/worktree-create.sh <branch-name>"
echo "  Remove:  ./scripts/worktree-remove.sh <branch-name>"
echo "  Start:   cd <worktree>/backend && docker compose up -d"
echo "  Stop:    cd <worktree>/backend && docker compose down"

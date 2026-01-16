#!/bin/bash
# worktree-remove.sh - Remove worktree and its Docker environment
# Usage: ./scripts/worktree-remove.sh <branch-name>

set -e

BRANCH_NAME="$1"

if [ -z "$BRANCH_NAME" ]; then
    echo "Usage: $0 <branch-name>"
    echo "Example: $0 feature/tonearm-api"
    echo ""
    echo "Current worktrees:"
    git worktree list
    exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAFE_BRANCH_NAME=$(echo "$BRANCH_NAME" | sed 's/[\/:]/-/g')
WORKTREE_DIR="${PROJECT_ROOT}-${SAFE_BRANCH_NAME}"

if [ ! -d "$WORKTREE_DIR" ]; then
    echo "❌ Worktree not found: $WORKTREE_DIR"
    echo ""
    echo "Current worktrees:"
    git worktree list
    exit 1
fi

echo "🗑️  Removing worktree for branch: $BRANCH_NAME"
echo "📁 Directory: $WORKTREE_DIR"
echo ""

# Stop Docker containers if running
if [ -f "$WORKTREE_DIR/backend/docker-compose.yml" ]; then
    echo "🐳 Stopping Docker containers..."
    cd "$WORKTREE_DIR/backend"
    docker compose down -v 2>/dev/null || true
fi

# Remove worktree
echo "🔧 Removing worktree..."
cd "$PROJECT_ROOT"
git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || rm -rf "$WORKTREE_DIR"

echo ""
echo "✅ Worktree removed successfully!"
echo ""
echo "📝 Note: Branch '$BRANCH_NAME' still exists."
echo "   To delete branch: git branch -d $BRANCH_NAME"

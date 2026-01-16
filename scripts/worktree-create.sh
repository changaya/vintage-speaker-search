#!/bin/bash
# worktree-create.sh - Create isolated worktree environment for a branch
# Usage: ./scripts/worktree-create.sh <branch-name> [base-branch]
#
# Example:
#   ./scripts/worktree-create.sh feature/tonearm-api
#   ./scripts/worktree-create.sh fix/cartridge-bug main

set -e

BRANCH_NAME="$1"
BASE_BRANCH="${2:-main}"

if [ -z "$BRANCH_NAME" ]; then
    echo "Usage: $0 <branch-name> [base-branch]"
    echo "Example: $0 feature/tonearm-api"
    exit 1
fi

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

# Create safe directory name from branch
SAFE_BRANCH_NAME=$(echo "$BRANCH_NAME" | sed 's/[\/:]/-/g')
WORKTREE_DIR="${PROJECT_ROOT}-${SAFE_BRANCH_NAME}"

# Calculate port offset based on branch name hash (0-9)
PORT_OFFSET=$(echo -n "$SAFE_BRANCH_NAME" | md5sum | tr -d -c '0-9' | head -c 1)
FRONTEND_PORT=$((3000 + PORT_OFFSET))
BACKEND_PORT=$((4000 + PORT_OFFSET))
DB_PORT=$((3306 + PORT_OFFSET))

echo "🌿 Creating worktree for branch: $BRANCH_NAME"
echo "📁 Directory: $WORKTREE_DIR"
echo "🔌 Ports: Frontend=$FRONTEND_PORT, Backend=$BACKEND_PORT, DB=$DB_PORT"
echo ""

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
    echo "⚠️  Worktree already exists at $WORKTREE_DIR"
    echo "   To remove: git worktree remove $WORKTREE_DIR"
    exit 1
fi

# Create branch if it doesn't exist
cd "$PROJECT_ROOT"
if ! git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "📝 Creating new branch '$BRANCH_NAME' from '$BASE_BRANCH'..."
    git branch "$BRANCH_NAME" "$BASE_BRANCH"
fi

# Create worktree
echo "🔧 Creating worktree..."
git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"

# Create .env.branch file with port configuration
cat > "$WORKTREE_DIR/backend/.env.branch" << EOF
# Branch-specific environment (auto-generated)
# Branch: $BRANCH_NAME
# Created: $(date)

BRANCH_NAME=$SAFE_BRANCH_NAME
COMPOSE_PROJECT_NAME=vintage-audio-${SAFE_BRANCH_NAME}

# Ports (offset to avoid conflicts)
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
DB_PORT=$DB_PORT

# Database
DATABASE_URL=mysql://vintage_user:vintage_pass@db:3306/vintage_audio
EOF

# Create docker-compose.override.yml
cat > "$WORKTREE_DIR/backend/docker-compose.override.yml" << EOF
# Auto-generated for branch: $BRANCH_NAME
# Ports: Frontend=$FRONTEND_PORT, Backend=$BACKEND_PORT, DB=$DB_PORT

services:
  db:
    container_name: vintage-audio-db-${SAFE_BRANCH_NAME}
    ports:
      - "${DB_PORT}:3306"
    volumes:
      - mysql_data_${SAFE_BRANCH_NAME}:/var/lib/mysql

  backend:
    container_name: vintage-audio-backend-${SAFE_BRANCH_NAME}
    ports:
      - "${BACKEND_PORT}:4000"
    environment:
      PORT: 4000

  frontend:
    container_name: vintage-audio-frontend-${SAFE_BRANCH_NAME}
    ports:
      - "${FRONTEND_PORT}:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:${BACKEND_PORT}

volumes:
  mysql_data_${SAFE_BRANCH_NAME}:
    driver: local
EOF

echo ""
echo "✅ Worktree created successfully!"
echo ""
echo "📋 Next steps:"
echo "   cd $WORKTREE_DIR/backend"
echo "   npm install"
echo "   docker compose up -d"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   Admin:    http://localhost:$FRONTEND_PORT/admin"
echo ""
echo "📝 To list all worktrees: git worktree list"
echo "🗑️  To remove this worktree: git worktree remove $WORKTREE_DIR"

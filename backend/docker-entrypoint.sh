#!/bin/sh
# docker-entrypoint.sh - Vintage Audio Backend Entrypoint
# Ensures Prisma client is always in sync with the current schema

set -e

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "📦 Checking database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "⚠️  No pending migrations or migration skipped"

echo "✅ Prisma Client ready"
echo "🚀 Starting application..."

# Execute the main command
exec "$@"

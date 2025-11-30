#!/usr/bin/env bash
set -e

# Wait for database to be ready (Skipped for managed Neon DB)
# /opt/wait-for-it.sh postgres:5432

# Run migrations
echo "Running migrations..."
npm run migration:run

# Start the application
echo "Starting application..."
node dist/main

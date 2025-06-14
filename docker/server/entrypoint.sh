#!/bin/bash
set -e

# Read database configuration from secrets
DB_USER=""
DB_PASSWORD=""
DB_NAME=""

if [ -f /run/secrets/db_user ]; then
    DB_USER=$(cat /run/secrets/db_user)
fi

if [ -f /run/secrets/db_password ]; then
    DB_PASSWORD=$(cat /run/secrets/db_password)
fi

if [ -f /run/secrets/db_name ]; then
    DB_NAME=$(cat /run/secrets/db_name)
fi

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}"

echo "Starting server with DATABASE_URL configured"

# Execute the original command
exec "$@" 
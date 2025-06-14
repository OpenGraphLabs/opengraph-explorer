#!/bin/bash
set -e

# Read secrets if they exist and override default values
if [ -f /run/secrets/db_name ]; then
    export POSTGRES_DB=$(cat /run/secrets/db_name)
fi

if [ -f /run/secrets/db_user ]; then
    export POSTGRES_USER=$(cat /run/secrets/db_user)
fi

if [ -f /run/secrets/db_password ]; then
    export POSTGRES_PASSWORD=$(cat /run/secrets/db_password)
fi

echo "Database initialization completed with:"
echo "- Database: $POSTGRES_DB"
echo "- User: $POSTGRES_USER" 
#!/bin/bash
set -e

# Read secrets if they exist
DB_NAME="opengraph"
DB_USER="opengraph_user"
DB_PASSWORD="password123"

if [ -f /run/secrets/db_name ]; then
    DB_NAME=$(cat /run/secrets/db_name)
fi

if [ -f /run/secrets/db_user ]; then
    DB_USER=$(cat /run/secrets/db_user)
fi

if [ -f /run/secrets/db_password ]; then
    DB_PASSWORD=$(cat /run/secrets/db_password)
fi

echo "Database initialization starting with:"
echo "- Database: $DB_NAME"
echo "- User: $DB_USER"

# Create user and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER "$DB_USER" WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
    CREATE DATABASE "$DB_NAME" OWNER "$DB_USER";
    GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
EOSQL

echo "Database initialization completed successfully!" 
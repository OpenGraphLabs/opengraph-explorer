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

# Configure PostgreSQL for external connections
echo "Configuring PostgreSQL for external connections..."

# Update postgresql.conf to listen on all addresses
echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf

# Update pg_hba.conf to allow external connections
echo "host all all 0.0.0.0/0 scram-sha-256" >> /var/lib/postgresql/data/pg_hba.conf
echo "host $DB_NAME $DB_USER 0.0.0.0/0 scram-sha-256" >> /var/lib/postgresql/data/pg_hba.conf

echo "Database initialization completed successfully!"
echo "External connections are now allowed for:"
echo "- Database: $DB_NAME"
echo "- User: $DB_USER"
echo "- Host: localhost:5432" 
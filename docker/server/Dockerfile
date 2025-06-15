# Multi-stage build for Rust application
FROM rust:1.87 AS builder

WORKDIR /app

# Copy Cargo files
COPY server/Cargo.toml server/Cargo.lock ./

# Create a dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY server/src ./src
COPY server/migrations ./migrations
COPY server/.sqlx ./.sqlx

# Build the application
RUN touch src/main.rs && cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install necessary packages
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/opengraph-server /app/opengraph-server
COPY --from=builder /app/migrations /app/migrations

# Create startup script to handle secrets
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Build DATABASE_URL from secrets\n\
if [ -f /run/secrets/db_user ] && [ -f /run/secrets/db_password ] && [ -f /run/secrets/db_name ]; then\n\
    DB_USER=$(cat /run/secrets/db_user)\n\
    DB_PASSWORD=$(cat /run/secrets/db_password)\n\
    DB_NAME=$(cat /run/secrets/db_name)\n\
    export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}"\n\
    echo "Using DATABASE_URL from secrets"\n\
else\n\
    echo "Using default DATABASE_URL"\n\
    export DATABASE_URL="${DATABASE_URL:-postgresql://opengraph_user:password123@postgres:5432/opengraph}"\n\
fi\n\
\n\
exec ./opengraph-server' > /app/start.sh && chmod +x /app/start.sh

# Create a non-root user
RUN useradd -r -s /bin/false opengraph
RUN chown -R opengraph:opengraph /app
USER opengraph

EXPOSE 8080

CMD ["./start.sh"] 
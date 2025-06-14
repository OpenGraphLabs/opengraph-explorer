# Multi-stage build for Rust application
FROM rust:1.87 as builder

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

# Copy entrypoint script
COPY docker/server/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create a non-root user
RUN useradd -r -s /bin/false opengraph
RUN chown -R opengraph:opengraph /app
USER opengraph

EXPOSE 8080

CMD ["./opengraph-server"] 
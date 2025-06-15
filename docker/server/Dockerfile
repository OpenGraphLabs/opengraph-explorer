FROM rust:1.87 AS builder

WORKDIR /app

COPY server/Cargo.toml server/Cargo.lock ./
COPY server/src ./src
COPY server/migrations ./migrations
COPY server/.sqlx ./.sqlx

RUN cargo build --release


# Runtime stage
FROM debian:bookworm-slim

# Install necessary packages
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/opengraph-server /app/opengraph-server
COPY --from=builder /app/migrations /app/migrations

# non-root user
RUN useradd -r -s /bin/false opengraph
USER opengraph

EXPOSE 8080

CMD [ "./opengraph-server" ]
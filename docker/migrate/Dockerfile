FROM rust:1.87

WORKDIR /app

COPY server/Cargo.toml server/Cargo.lock ./
COPY server/src ./src
COPY server/migrations ./migrations

RUN cargo install sqlx-cli --no-default-features --features postgres

CMD ["bash"]
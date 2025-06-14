# OpenGraph Annotation Challenge Server
# Essential commands for development

.PHONY: build run test clean migrate

build:
	@echo "🔨 Building OpenGraph Server..."
	cargo build

run:
	@echo "🚀 Starting OpenGraph Server..."
	cargo run

clean:
	@echo "🧹 Cleaning build artifacts..."
	cargo clean

# Database migration
migrate:
	@echo "🔄 Running database migrations..."
	sqlx database create
	sqlx migrate run
	cargo sqlx prepare

test:
	@echo "🧪 Running tests..."
	cargo test

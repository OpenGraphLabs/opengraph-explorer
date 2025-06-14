# OpenGraph Annotation Challenge Server
# Essential commands for development

.PHONY: help build run test clean db-up db-down db-reset sqlx-prepare

# Default target
help:
	@echo "🚀 OpenGraph Server - Essential Commands"
	@echo ""
	@echo "📦 Build & Run:"
	@echo "  make build        - Build the project"
	@echo "  make run          - Run the server"
	@echo "  make clean        - Clean build artifacts"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  make db-up        - Start PostgreSQL container"
	@echo "  make db-down      - Stop PostgreSQL container"
	@echo "  make db-reset     - Reset database (stop, start, migrate)"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make sqlx-prepare - Generate SQLx query cache"
	@echo "  make test         - Run tests"
	@echo ""

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

# Quick development setup (first time)
setup: db-up sqlx-prepare build
	@echo "✅ Development environment ready!"
	@echo "🎯 Run make run to start the server"
# OpenGraph Database Migration Commands
.PHONY: help create-migration upgrade-db downgrade-db reset-db run

help:
	@echo "Available database migration commands:"
	@echo "  create-migration  - Create new migration (usage: make create-migration MSG='message')"
	@echo "  upgrade-db        - Apply all pending migrations"
	@echo "  downgrade-db      - Rollback one migration"
	@echo "  reset-db          - Reset database and apply all migrations"

create-migration:
	@if [ -z "$(MSG)" ]; then \
		echo "Error: Please provide a message. Usage: make create-migration MSG='your message'"; \
		exit 1; \
	fi
	@echo "Creating migration: $(MSG)"
	alembic revision --autogenerate -m "$(MSG)"

upgrade-db:
	@echo "Applying all pending migrations..."
	alembic upgrade head

downgrade-db:
	@echo "Rolling back one migration..."
	alembic downgrade -1

reset-db:
	@echo "Resetting database..."
	@echo "Warning: This will destroy all data. Continue? (y/N)"
	@read confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 10
	alembic upgrade head
	@echo "Database reset complete!"

run:
	@echo "Running the application..."
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# OpenGraph Docker Essential Commands
.PHONY: help run dev stop stop-dev restart logs logs-server logs-client clean size populate-tasks populate-tasks-dev

# Default variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml

# Default target - show help
help:
	@echo "Available commands:"
	@echo "  make run          - Run production environment"
	@echo "  make dev          - Run development environment"
	@echo "  make stop         - Stop production containers"
	@echo "  make stop-dev     - Stop development containers"
	@echo "  make restart      - Rebuild and restart (new images)"
	@echo "  make logs         - View all logs"
	@echo "  make logs-server  - View server logs"
	@echo "  make logs-client  - View client logs"
	@echo "  make size         - Show image sizes"
	@echo "  make clean        - Clean unused Docker resources"
	@echo ""
	@echo "Script commands:"
	@echo "  make populate-tasks        - Run production populate_tasks.py script"
	@echo "  make populate-tasks-dev    - Run development populate_tasks.py script"

# Run production environment
run:
	@echo "[Prod] Starting OpenGraph Explorer application..."
	$(DOCKER_COMPOSE) --env-file .env.production up --build -d

# Run development environment
dev:
	@echo "[Dev] Starting OpenGraph Explorer application..."
	$(DOCKER_COMPOSE_DEV) --env-file .env.local up --build -d

# Stop all containers
stop:
	@echo "[Prod] Stopping..."
	$(DOCKER_COMPOSE) down

# Stop development containers
stop-dev:
	@echo "[Dev] Stopping..."
	$(DOCKER_COMPOSE_DEV) down

# Restart with rebuilding (stop, build new images, and start)
restart: stop
	$(DOCKER_COMPOSE) --env-file .env up --build -d

# View logs
logs:
	$(DOCKER_COMPOSE) logs -f

# View server logs only
logs-server:
	$(DOCKER_COMPOSE) logs server -f

# View client logs only
logs-client:
	$(DOCKER_COMPOSE) logs client -f

# Clean Docker resources
clean:
	docker system prune -f

# Show image sizes
size:
	@docker images --format "{{.Repository}}:{{.Tag}} - {{.Size}}" | grep -E 'opengraph|server|client'

# Run populate_tasks.py script
populate-tasks:
	@echo "Running populate_tasks.py script..."
	docker exec opengraph-server python scripts/populate_tasks.py

populate-tasks-dev:
	@echo "Running populate_tasks.py script..."
	docker exec opengraph-server-dev python scripts/populate_tasks.py


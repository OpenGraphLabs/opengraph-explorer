# OpenGraph Docker Essential Commands
.PHONY: build run stop restart logs clean help

# Default variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml

# Build images
build:
	$(DOCKER_COMPOSE) build

# Run production environment
run:
	$(DOCKER_COMPOSE) up -d

# Run development environment
dev:
	$(DOCKER_COMPOSE_DEV) up -d

# Stop all containers
stop:
	$(DOCKER_COMPOSE) down

# Stop development containers
stop-dev:
	$(DOCKER_COMPOSE_DEV) down

# Restart with rebuilding (stop, build new images, and start)
restart: stop
	$(DOCKER_COMPOSE) up --build -d

# View logs
logs:
	$(DOCKER_COMPOSE) logs -f

# View server logs only
logs-server:
	$(DOCKER_COMPOSE) logs -f server

# View client logs only
logs-client:
	$(DOCKER_COMPOSE) logs -f client

# Clean Docker resources
clean:
	docker system prune -f

# Show image sizes
size:
	@docker images --format "{{.Repository}}:{{.Tag}} - {{.Size}}" | grep -E 'opengraph|server|client'

# Help
help:
	@echo "Available commands:"
	@echo "  make build        - Build Docker images"
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

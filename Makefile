.PHONY: help install start build test test-watch clean docker-build docker-up docker-dev-up docker-down docker-rebuild docker-logs docker-clean

.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "  Voice to Text - Available Commands"
	@echo "  =================================="
	@echo ""
	@echo "  Development:"
	@echo "    make install         Install all npm dependencies"
	@echo "    make start           Start Angular dev server (localhost:4200)"
	@echo "    make test            Run unit tests once"
	@echo "    make test-watch      Run unit tests in watch mode"
	@echo "    make build           Build for production"
	@echo "    make clean           Remove build artifacts and node_modules"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build    Build production Docker image"
	@echo "    make docker-up       Start production container (port 4200)"
	@echo "    make docker-dev-up   Start dev container with hot-reload (port 4201)"
	@echo "    make docker-down     Stop all running containers"
	@echo "    make docker-rebuild  Rebuild and restart production container"
	@echo "    make docker-logs     View container logs (follow mode)"
	@echo "    make docker-clean    Remove all Docker images, containers, and volumes"
	@echo ""

install:
	npm ci

start:
	ng serve

test:
	npm run test -- --watch=false --browsers=chromium

test-watch:
	npm run test -- --browsers=chromium

build:
	ng build --configuration=production

clean:
	rm -rf dist/ node_modules/

docker-build:
	docker build -t voice-to-text:latest .

docker-up:
	docker compose up -d voice-to-text

docker-dev-up:
	docker compose up -d voice-to-text-dev

docker-down:
	docker compose down

docker-rebuild:
	docker compose up -d --build voice-to-text

docker-logs:
	docker compose logs -f voice-to-text

docker-clean:
	docker compose down --rmi local --volumes --remove-orphans

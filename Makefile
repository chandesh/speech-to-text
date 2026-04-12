.PHONY: help install dev test test-watch build clean build-image start stop container logs clean-docker rebuild

.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "  Speech to Text - Available Commands"
	@echo "  ==================================="
	@echo ""
	@echo "  Development:"
	@echo "    make install        Install all npm dependencies"
	@echo "    make dev            Start Angular dev server (localhost:4200)"
	@echo "    make test           Run unit tests once"
	@echo "    make test-watch     Run unit tests in watch mode"
	@echo "    make build          Build for production"
	@echo "    make clean          Remove build artifacts and node_modules"
	@echo ""
	@echo "  Docker:"
	@echo "    make build-image   Build production Docker image"
	@echo "    make start         Start production container (port 4200)"
	@echo "    make container      Start dev container with hot-reload (port 4201)"
	@echo "    make stop          Stop all running containers"
	@echo "    make rebuild       Rebuild and restart production container"
	@echo "    make logs          View container logs (follow mode)"
	@echo "    make clean-docker  Remove all Docker images, containers, and volumes"
	@echo ""

install:
	npm ci

dev:
	ng serve

test:
	npm run test -- --watch=false --browsers=chromium

test-watch:
	npm run test -- --browsers=chromium

build:
	ng build --configuration=production

clean:
	rm -rf dist/ node_modules/

build-image:
	docker build -t speech-to-text:latest --load .

start:
	docker compose up -d speech-to-text

container:
	docker compose up -d speech-to-text-dev

stop:
	docker compose down

rebuild:
	docker compose up -d --build speech-to-text

logs:
	docker compose logs -f speech-to-text

clean-docker:
	docker compose down --rmi local --volumes --remove-orphans

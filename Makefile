.PHONY: help install dev test test-watch build clean
.PHONY: typecheck lint lint-fix format format-check
.PHONY: build-image start stop restart devstart rebuild logs
.PHONY: backend-build backend-start backend-stop backend-restart backend-rebuild backend-logs backend-shell
.PHONY: db-start db-stop db-shell
.PHONY: stack-up stack-down clean-docker

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
	@echo "    make typecheck      Run TypeScript type checking"
	@echo "    make lint           Run ESLint"
	@echo "    make lint-fix       Run ESLint with auto-fix"
	@echo "    make format         Format with Prettier"
	@echo "    make build          Build frontend for production"
	@echo "    make clean          Remove build artifacts and node_modules"
	@echo ""
	@echo "  Frontend Docker:"
	@echo "    make build-image    Build production Docker image"
	@echo "    make start          Start production container (port 4200)"
	@echo "    make devstart       Start dev container with hot-reload (port 4201)"
	@echo "    make restart        Restart production container"
	@echo "    make rebuild        Rebuild and restart production container"
	@echo "    make logs           View frontend container logs (follow)"
	@echo ""
	@echo "  Backend Docker:"
	@echo "    make backend-build    Build backend Docker image"
	@echo "    make backend-start    Start postgres + backend services"
	@echo "    make backend-stop     Stop backend + postgres services"
	@echo "    make backend-restart  Restart backend service only"
	@echo "    make backend-rebuild  Rebuild and restart backend + postgres"
	@echo "    make backend-logs     View backend container logs (follow)"
	@echo "    make backend-shell    Open a shell in the backend container"
	@echo ""
	@echo "  Database:"
	@echo "    make db-start       Start postgres only"
	@echo "    make db-stop        Stop postgres only"
	@echo "    make db-shell       Open psql shell in postgres"
	@echo ""
	@echo "  Full Stack:"
	@echo "    make stack-up       Start frontend + backend + postgres"
	@echo "    make stack-down     Stop all containers"
	@echo "    make clean-docker   Remove all Docker images, containers, volumes"
	@echo ""

# ---- Frontend Development ----

install:
	npm ci

dev:
	ng serve

test:
	npm run test -- --watch=false --browsers=chromium

test-watch:
	npm run test -- --browsers=chromium

typecheck:
	npx tsc --noEmit

lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

build:
	ng build --configuration=production

clean:
	rm -rf dist/ node_modules/

# ---- Frontend Docker ----

build-image:
	docker build -t speech-to-text:latest --load .

start:
	docker compose up -d speech-to-text
	@echo ""
	@echo "  Frontend started at: http://localhost:4200"
	@echo ""

devstart:
	docker compose up -d speech-to-text-dev
	@echo ""
	@echo "  Dev frontend started at: http://localhost:4201"
	@echo ""

restart:
	docker compose restart speech-to-text
	@echo ""
	@echo "  Frontend restarted at: http://localhost:4200"
	@echo ""

rebuild:
	docker compose up -d --build speech-to-text
	@echo ""
	@echo "  Frontend rebuilt and started at: http://localhost:4200"
	@echo ""

logs:
	docker compose logs -f speech-to-text

# ---- Backend Docker ----

backend-build:
	docker compose build backend

backend-start:
	docker compose up -d postgres backend
	@echo ""
	@echo "  PostgreSQL running on port 5432"
	@echo "  Backend API running at: http://localhost:1212"
	@echo "  Health check: curl http://localhost:1212/api/health"
	@echo ""

backend-stop:
	docker compose down postgres backend
	@echo ""
	@echo "  Backend services stopped."
	@echo ""

backend-restart:
	docker compose restart backend
	@echo ""
	@echo "  Backend restarted at: http://localhost:1212"
	@echo ""

backend-rebuild:
	docker compose up -d --build --force-recreate backend
	@echo ""
	@echo "  Backend rebuilt and started at: http://localhost:1212"
	@echo ""

backend-logs:
	docker compose logs -f backend

backend-shell:
	docker compose exec backend /bin/sh

# ---- Database ----

db-start:
	docker compose up -d postgres
	@echo ""
	@echo "  PostgreSQL started on port 5432"
	@echo ""

db-stop:
	docker compose down postgres
	@echo ""
	@echo "  PostgreSQL stopped."
	@echo ""

db-shell:
	docker compose exec postgres psql -U s2t -d speech_to_text

# ---- Full Stack ----

stack-up:
	docker compose up -d --build speech-to-text postgres backend
	@echo ""
	@echo "  Frontend: http://localhost:4200"
	@echo "  Backend:  http://localhost:1212/api/health"
	@echo ""

stack-down:
	docker compose down

clean-docker:
	docker compose down --rmi local --volumes --remove-orphans

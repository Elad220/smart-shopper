.PHONY: help install test test-watch test-coverage test-ci clean lint fix docker-up docker-down
.PHONY: backend-dev backend-test backend-coverage backend-start backend-lint
.PHONY: frontend-dev frontend-build frontend-test frontend-coverage frontend-lint

# Default target
help:
	@echo "Available targets:"
	@echo "  install             Install dependencies for both frontend and backend"
	@echo "  test                Run all tests (frontend and backend)"
	@echo "  test-watch          Run tests in watch mode"
	@echo "  test-coverage       Run tests with coverage report"
	@echo "  test-ci             Run tests in CI mode with detailed reporting"
	@echo "  lint                Lint both frontend and backend code"
	@echo "  fix                 Fix linting issues automatically"
	@echo "  clean               Clean build artifacts and dependencies"
	@echo ""
	@echo "Backend targets:"
	@echo "  backend-dev         Run backend in dev mode (nodemon)"
	@echo "  backend-start       Run backend in production mode"
	@echo "  backend-test        Run backend tests (Jest)"
	@echo "  backend-coverage    Run backend test coverage"
	@echo "  backend-lint        Lint backend code"
	@echo ""
	@echo "Frontend targets:"
	@echo "  frontend-dev        Run frontend in dev mode (Vite)"
	@echo "  frontend-build      Build frontend (Vite)"
	@echo "  frontend-test       Run frontend tests (Vitest)"
	@echo "  frontend-coverage   Run frontend test coverage"
	@echo "  frontend-lint       Lint frontend code"
	@echo ""
	@echo "Docker targets:"
	@echo "  docker-up           Start MongoDB with Docker Compose"
	@echo "  docker-down         Stop MongoDB Docker Compose"

# Install dependencies
install:
	@echo "Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install

# Comprehensive testing
test:
	@echo "Running all tests..."
	$(MAKE) backend-test &
	$(MAKE) frontend-test &
	wait

test-watch:
	@echo "Running tests in watch mode..."
	$(MAKE) backend-test-watch &
	$(MAKE) frontend-test-watch &
	wait

test-coverage:
	@echo "Running tests with coverage..."
	$(MAKE) backend-coverage &
	$(MAKE) frontend-coverage &
	wait

test-ci:
	@echo "Running tests in CI mode..."
	$(MAKE) backend-test-ci &
	$(MAKE) frontend-test-ci &
	wait

# Linting
lint:
	@echo "Linting all code..."
	$(MAKE) backend-lint &
	$(MAKE) frontend-lint &
	wait

fix:
	@echo "Fixing linting issues..."
	cd backend && npm run lint --fix || true
	cd frontend && npm run lint --fix || true

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/node_modules backend/coverage backend/test-results.html
	rm -rf frontend/node_modules frontend/coverage frontend/dist frontend/test-results.html frontend/test-results.json

# Backend targets
backend-dev:
	cd backend && npm install && npm run dev

backend-start:
	cd backend && npm install && npm start

backend-test:
	cd backend && npm install && npm test

backend-test-watch:
	cd backend && npm install && npm run test:watch

backend-coverage:
	cd backend && npm install && npm run test:coverage

backend-test-ci:
	cd backend && npm install && npm run test:ci

backend-lint:
	cd backend && npm install && npm run lint || echo "Backend linting not configured"

# Frontend targets
frontend-dev:
	cd frontend && npm install && npm run dev

frontend-build:
	cd frontend && npm install && npm run build

frontend-test:
	cd frontend && npm install && npm run test:run

frontend-test-watch:
	cd frontend && npm install && npm run test:watch

frontend-coverage:
	cd frontend && npm install && npm run test:coverage

frontend-test-ci:
	cd frontend && npm install && npm run test:ci

frontend-lint:
	cd frontend && npm install && npm run lint

# Docker targets
docker-up:
	docker compose up -d

docker-down:
	docker compose down

# Development workflow
dev:
	@echo "Starting development environment..."
	$(MAKE) docker-up
	$(MAKE) backend-dev &
	$(MAKE) frontend-dev &
	wait

# Production build
build:
	@echo "Building for production..."
	$(MAKE) frontend-build
	$(MAKE) backend-start
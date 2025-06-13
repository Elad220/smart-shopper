.PHONY: help backend-dev backend-test backend-coverage backend-start frontend-dev frontend-build frontend-test frontend-coverage frontend-lint docker-up docker-down

help:
	@echo "Available targets:"
	@echo "  backend-dev         Run backend in dev mode (nodemon)"
	@echo "  backend-start       Run backend in production mode"
	@echo "  backend-test        Run backend tests (Jest)"
	@echo "  backend-coverage    Run backend test coverage"
	@echo "  frontend-dev        Run frontend in dev mode (Vite)"
	@echo "  frontend-build      Build frontend (Vite)"
	@echo "  frontend-test       Run frontend tests (Vitest)"
	@echo "  frontend-coverage   Run frontend test coverage"
	@echo "  frontend-lint       Lint frontend code"
	@echo "  docker-up           Start MongoDB with Docker Compose"
	@echo "  docker-down         Stop MongoDB Docker Compose"

backend-dev:
	cd backend && npm install && npm run dev

backend-start:
	cd backend && npm install && npm start

backend-test:
	cd backend && npm install && npm test

backend-coverage:
	cd backend && npm install && npm run test:coverage

frontend-dev:
	cd frontend && npm install && npm run dev

frontend-build:
	cd frontend && npm install && npm run build

frontend-test:
	cd frontend && npm install && npm run test

frontend-coverage:
	cd frontend && npm install && npm run test:coverage

frontend-lint:
	cd frontend && npm install && npm run lint

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down 
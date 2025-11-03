# Variables
APP_NAME = expedientes-backend
GO_VERSION = 1.21
DOCKER_IMAGE = $(APP_NAME):latest

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
.PHONY: help
help:
	@echo "Available commands:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'

## dev: Run the application in development mode
.PHONY: dev
dev:
	go run cmd/main.go

## build: Build the application
.PHONY: build
build:
	go build -o bin/$(APP_NAME) cmd/main.go

## test: Run tests
.PHONY: test
test:
	go test -v ./...

## test-coverage: Run tests with coverage
.PHONY: test-coverage
test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

## deps: Download dependencies
.PHONY: deps
deps:
	go mod download
	go mod tidy

## lint: Run linting
.PHONY: lint
lint:
	golangci-lint run

## docker-build: Build Docker image
.PHONY: docker-build
docker-build:
	docker build -t $(DOCKER_IMAGE) .

## docker-run: Run Docker container
.PHONY: docker-run
docker-run:
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

## docker-up: Start all services with docker-compose
.PHONY: docker-up
docker-up:
	docker-compose up -d

## docker-down: Stop all services
.PHONY: docker-down
docker-down:
	docker-compose down

## docker-logs: View logs
.PHONY: docker-logs
docker-logs:
	docker-compose logs -f

## clean: Clean build artifacts
.PHONY: clean
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html
	go clean

## setup: Setup development environment
.PHONY: setup
setup:
	@echo "Setting up development environment..."
	go mod download
	@echo "Installing tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "Setup complete!"

## migrate: Run database migrations
.PHONY: migrate
migrate:
	@echo "Running database migrations..."
	go run scripts/migrate.go

## seed: Seed database with sample data
.PHONY: seed
seed:
	@echo "Seeding database..."
	go run scripts/seed.go

## health: Check service health
.PHONY: health
health:
	curl -f http://localhost:8080/health || exit 1
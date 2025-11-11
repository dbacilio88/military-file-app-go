# =============================================================================
# Multi-stage Dockerfile for Go Backend - Sistema de Expedientes Militares
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# -----------------------------------------------------------------------------
FROM golang:1.24-alpine AS builder

# Add metadata
LABEL maintainer="Sistema Expedientes <soporte@sistema.mil>"
LABEL description="Backend API para Sistema de Expedientes Militares"

# Install git, ca-certificates and timezone data
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod and sum files first for better Docker layer caching
COPY go.mod ./

# Download dependencies (esto generará go.sum automáticamente)
RUN go mod download && go mod verify

# Copy source code
COPY . .

# Build the application with optimizations
# CGO_ENABLED=0: Disable CGO for static binary
# -ldflags: Linker flags to reduce binary size and remove debug info
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags='-w -s -extldflags "-static"' \
    -o main ./cmd/main.go

# -----------------------------------------------------------------------------
# Stage 2: Runtime Stage
# -----------------------------------------------------------------------------
FROM alpine:3.18

# Add metadata
LABEL maintainer="Sistema Expedientes <soporte@sistema.mil>"
LABEL description="Sistema de Expedientes Militares - Backend Runtime"
LABEL version="1.0.0"

# Install essential packages
RUN apk --no-cache add \
    ca-certificates \
    tzdata \
    wget \
    && update-ca-certificates

# Set timezone
ENV TZ=America/Lima
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup -h /app

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy documentation if needed
COPY --from=builder /app/docs ./docs

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs temp && \
    chown -R appuser:appgroup /app && \
    chmod 755 /app/main

# Switch to non-root user
USER appuser

# Expose port (8082 as per your configuration)
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/api/v1/health || exit 1

# Set environment variables for production
ENV GIN_MODE=release
ENV ENV=production

# Run the binary
ENTRYPOINT ["./main"]
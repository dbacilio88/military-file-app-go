# Build stage
FROM golang:1.24-alpine AS builder

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates
RUN apk --no-cache add ca-certificates

# Create non-root user
RUN adduser -D -g '' appuser

# Set working directory
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy .env file if exists
COPY .env* ./

# Create uploads directory
RUN mkdir -p uploads && chown appuser:appuser uploads

# Use non-root user
USER appuser

# Expose port
EXPOSE 8080

# Command to run
CMD ["./main"]
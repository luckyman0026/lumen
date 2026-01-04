# Build stage
FROM golang:1.22-alpine AS builder

# Install git and ca-certificates for fetching dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files first for better caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/collector \
    ./cmd/server

# Final stage - using distroless for minimal attack surface
FROM gcr.io/distroless/static:nonroot

# Copy timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy CA certificates
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary
COPY --from=builder /app/collector /collector

# Use non-root user
USER nonroot:nonroot

# Expose the API port
EXPOSE 8080

# Run the collector
ENTRYPOINT ["/collector"]

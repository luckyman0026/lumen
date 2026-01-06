# Backend Quickstart Guide

Get the AI Traffic Analyzer backend running in under 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Ports 8080, 8123, and 9000 available
- curl (for testing)

## Quick Start

### 1. Start the Stack

```bash
# From project root
docker compose up -d

# Watch logs (optional)
docker compose logs -f collector
```

This starts:
- **collector** - Event collector API on `http://localhost:8080`
- **clickhouse** - Analytics database on ports 8123 (HTTP) / 9000 (native)

### 2. Verify Health

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-12-26T12:00:00Z"}
```

### 3. Set Your API Key

The default API key is `your-secret-token-here` (set in docker-compose.yml).

For production, change `INGEST_TOKEN` in docker-compose.yml:
```yaml
environment:
  - INGEST_TOKEN=your-secure-api-key-here
```

Then restart:
```bash
docker compose down && docker compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `INGEST_TOKEN` | `your-secret-token-here` | API key for authentication |
| `HTTP_PORT` | `8080` | HTTP server port |
| `CLICKHOUSE_HOST` | `clickhouse` | ClickHouse hostname |
| `CLICKHOUSE_PORT` | `9000` | ClickHouse native port |
| `CLICKHOUSE_DB` | `default` | Database name |
| `CLICKHOUSE_USER` | `default` | Database user |
| `CLICKHOUSE_PASSWORD` | `` | Database password |
| `BUFFER_SIZE` | `1000` | Events before flush |
| `FLUSH_INTERVAL` | `1` | Seconds between flushes |

## End-to-End Validation

### Ingest Sample Events

```bash
# Ingest AI bot traffic (GPTBot)
curl -X POST http://localhost:8080/v1/events \
  -H "X-API-Key: your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "version": "1",
        "eventType": "request",
        "requestId": "11111111-1111-1111-1111-111111111111",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "method": "GET",
        "pathname": "/api/products",
        "userAgent": "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
        "ip": "10.0.0.1"
      },
      {
        "version": "1",
        "eventType": "request",
        "requestId": "22222222-2222-2222-2222-222222222222",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "method": "GET",
        "pathname": "/api/catalog",
        "userAgent": "Mozilla/5.0 (compatible; ClaudeBot/1.0)",
        "ip": "10.0.0.2"
      },
      {
        "version": "1",
        "eventType": "request",
        "requestId": "33333333-3333-3333-3333-333333333333",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "method": "GET",
        "pathname": "/api/products",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "ip": "10.0.0.3"
      }
    ]
  }'
```

Expected: `{"ok":true}`

### Query Analytics

```bash
# Wait for buffer flush (1 second)
sleep 2

# Get overview
curl "http://localhost:8080/v1/overview" \
  -H "X-API-Key: your-secret-token-here"

# Get timeseries (hourly buckets)
curl "http://localhost:8080/v1/timeseries?bucket=hour&limit=24" \
  -H "X-API-Key: your-secret-token-here"

# Get top routes
curl "http://localhost:8080/v1/top-routes?limit=10" \
  -H "X-API-Key: your-secret-token-here"

# Get top bots
curl "http://localhost:8080/v1/top-bots?limit=10" \
  -H "X-API-Key: your-secret-token-here"
```

### Verify in ClickHouse

```bash
docker exec ai-traffic-clickhouse clickhouse-client \
  --query "SELECT is_ai, ai_vendor, bot_name, route, count() as cnt FROM ai_traffic_events GROUP BY is_ai, ai_vendor, bot_name, route"
```

## Stopping the Stack

```bash
docker compose down

# To also remove data volumes:
docker compose down -v
```

## Troubleshooting

### Collector won't start

Check ClickHouse is healthy:
```bash
docker compose ps
docker compose logs clickhouse
```

### Authentication errors

Verify your API key matches `INGEST_TOKEN`:
```bash
docker compose exec collector env | grep INGEST_TOKEN
```

### No data in queries

1. Check buffer flushed (wait 2 seconds after ingest)
2. Verify events were accepted (`{"ok":true}`)
3. Query ClickHouse directly:
```bash
docker exec ai-traffic-clickhouse clickhouse-client \
  --query "SELECT count() FROM ai_traffic_events"
```

## API Reference

See [API.md](../API.md) for complete endpoint documentation.

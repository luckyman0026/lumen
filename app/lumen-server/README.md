# Lumen - Event Collector

A high-throughput event collector service for analyzing AI traffic patterns. This service ingests request events from client SDKs, classifies AI bot traffic using User-Agent analysis, and stores data in ClickHouse for analytics.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Make sure ports 8080, 8123, and 9000 are available

### Run with Docker Compose

```bash
# Start the services
docker compose up -d

# Check logs
docker compose logs -f collector

# Stop services
docker compose down
```

### Verify the Service

```bash
# Health check
curl http://localhost:8080/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00Z"}
```

## 📡 API Reference

### Authentication

All API endpoints (except health check) require authentication via:
- `X-API-Key: <token>` header

### Health Check

```
GET /health
```

Returns health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Ingest Events

```
POST /v1/events
Authorization: Bearer <token>
Content-Type: application/json
```

Ingests a batch of events (1-5000 events per request).

**Request Body:**
```json
{
  "events": [
    {
      "version": "1",
      "eventType": "request",
      "requestId": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2024-01-01T12:00:00Z",
      "nonce": "abc123",
      "keyId": "key-001",
      "method": "GET",
      "pathname": "/api/products",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
      "referer": "https://example.com"
    }
  ]
}
```

**Success Response:**
```json
{
  "ok": true
}
```

**Error Response:**
```json
{
  "error": "validation_error",
  "code": "missing_field",
  "details": "requestId is required for event tracking"
}
```

### Example: Send Test Events

```bash
# Send a single event
curl -X POST http://localhost:8080/v1/events \
  -H "Authorization: Bearer your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "version": "1",
        "eventType": "request",
        "requestId": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2024-01-01T12:00:00Z",
        "nonce": "test-nonce",
        "keyId": "api-key-001",
        "method": "GET",
        "pathname": "/api/users",
        "ip": "10.0.0.1",
        "userAgent": "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
        "referer": "https://example.com"
      }
    ]
  }'

# Send multiple events including different bot types
curl -X POST http://localhost:8080/v1/events \
  -H "Authorization: Bearer your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "version": "1",
        "eventType": "request",
        "requestId": "550e8400-e29b-41d4-a716-446655440001",
        "timestamp": "2024-01-01T12:00:01Z",
        "nonce": "nonce-1",
        "keyId": "key-001",
        "method": "GET",
        "pathname": "/api/articles",
        "ip": "10.0.0.2",
        "userAgent": "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com)",
        "referer": ""
      },
      {
        "version": "1",
        "eventType": "request",
        "requestId": "550e8400-e29b-41d4-a716-446655440002",
        "timestamp": "2024-01-01T12:00:02Z",
        "nonce": "nonce-2",
        "keyId": "key-001",
        "method": "POST",
        "pathname": "/api/search",
        "ip": "10.0.0.3",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "referer": "https://google.com"
      }
    ]
  }'
```

### Analytics APIs

All analytics endpoints support the following query parameters:
- `from` - Start timestamp (RFC3339, default: 24 hours ago)
- `to` - End timestamp (RFC3339, default: now)
- `route` - Filter by specific route (optional)
- `ai_only` - Show only AI traffic when set to `true` (optional)
- `limit` - Max results to return (default: 10, max: 1000)

#### GET /v1/overview

Returns total vs AI requests in time range, with estimated revenue based on default pricing.

```bash
curl "http://localhost:8080/v1/overview?from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z" \
  -H "X-API-Key: your-secret-token-here"
```

**Response:**
```json
{
  "total_requests": 120000,
  "ai_requests": 36000,
  "ai_share": 0.3,
  "estimated_revenue": {
    "low": 12.60,
    "mid": 18.00,
    "high": 23.40
  }
}
```

The `estimated_revenue` is calculated using `DEFAULT_PRICE_PER_1K` and `DEFAULT_PAY_THROUGH` environment variables.

#### GET /v1/timeseries

Returns time-bucketed counts. Supports `bucket=hour` (default) or `bucket=day`.

```bash
curl "http://localhost:8080/v1/timeseries?from=2024-01-01T00:00:00Z&to=2024-01-02T00:00:00Z&bucket=hour" \
  -H "X-API-Key: your-secret-token-here"
```

**Response:**
```json
[
  { "ts": "2024-01-01T10:00:00Z", "total": 1200, "ai": 300 },
  { "ts": "2024-01-01T11:00:00Z", "total": 1500, "ai": 420 }
]
```

#### GET /v1/top-bots

Returns top AI bots by request count.

```bash
curl "http://localhost:8080/v1/top-bots?limit=5" \
  -H "X-API-Key: your-secret-token-here"
```

**Response:**
```json
[
  { "ai_operator": "openai", "ai_bot": "GPTBot", "requests": 1800 },
  { "ai_operator": "anthropic", "ai_bot": "ClaudeBot", "requests": 1200 }
]
```

#### GET /v1/top-routes

Returns top routes hit by AI traffic.

```bash
curl "http://localhost:8080/v1/top-routes?limit=5" \
  -H "X-API-Key: your-secret-token-here"
```

**Response:**
```json
[
  { "route": "/api/catalog", "ai_requests": 2200 },
  { "route": "/api/products", "ai_requests": 1800 }
]
```

#### GET /v1/route-prices

Returns all saved route prices. These prices are automatically saved when calling `/v1/opportunity/estimate` with `route_prices`.

```bash
curl "http://localhost:8080/v1/route-prices" \
  -H "X-API-Key: your-secret-token-here"
```

**Response:**
```json
{
  "/api/catalog": 0.50,
  "/api/products": 1.20,
  "/api/search": 2.00
}
```

#### POST /v1/opportunity/estimate

Estimates potential revenue from AI traffic monetization. Supports two pricing modes:

1. **Flat pricing**: Use `price_per_1k` with `routes` array for uniform pricing across all routes
2. **Per-route pricing**: Use `route_prices` map for different prices per route (includes detailed breakdown)

**Note:** When using per-route pricing mode, the route prices are automatically saved to the database and can be retrieved later via `GET /v1/route-prices`.

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string | No | Start time (RFC3339 format) |
| `to` | string | No | End time (RFC3339 format) |
| `pay_through` | float | No | Percentage of AI traffic that pays (0.0-1.0) |
| `ai_classes` | array | No | Filter by AI class (`training`, `search`, `assistant`) |
| `routes` | array | No* | Routes to analyze (required for flat pricing) |
| `price_per_1k` | float | No* | Flat price per 1000 requests (flat pricing mode) |
| `route_prices` | object | No* | Map of route → price per 1000 requests (per-route mode) |

*Either `price_per_1k` + `routes` OR `route_prices` should be provided.

##### Flat Pricing Mode

```bash
curl -X POST "http://localhost:8080/v1/opportunity/estimate" \
  -H "X-API-Key: your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-02T00:00:00Z",
    "routes": ["/api/catalog", "/api/products"],
    "price_per_1k": 0.5,
    "pay_through": 0.3,
    "ai_classes": ["training"]
  }'
```

**Response:**
```json
{
  "ai_requests": 12000,
  "chargeable_requests": 3600,
  "estimated_revenue": {
    "low": 1.26,
    "mid": 1.80,
    "high": 2.34
  }
}
```

#### Per-Route Pricing Mode

Instead of a flat `price_per_1k`, you can specify different prices per route using `route_prices`. This returns a detailed breakdown by route:

```bash
curl -X POST http://localhost:8080/v1/opportunity/estimate \
  -H "X-API-Key: your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-02T00:00:00Z",
    "route_prices": {
      "/api/catalog": 0.50,
      "/api/products": 1.20,
      "/api/search": 2.00
    },
    "pay_through": 0.3,
    "ai_classes": ["training"]
  }'
```

**Response (with route breakdown):**
```json
{
  "ai_requests": 15000,
  "chargeable_requests": 4500,
  "estimated_revenue": {
    "low": 2.10,
    "mid": 3.00,
    "high": 3.90
  },
  "route_breakdown": [
    {
      "route": "/api/catalog",
      "ai_requests": 5000,
      "revenue": 0.75
    },
    {
      "route": "/api/products",
      "ai_requests": 8000,
      "revenue": 2.88
    },
    {
      "route": "/api/search",
      "ai_requests": 2000,
      "revenue": 1.20
    }
  ]
}
```

## ⚙️ Configuration

All configuration is done via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `INGEST_TOKEN` | **(required)** | Bearer token for API authentication |
| `HTTP_PORT` | `8080` | HTTP server port |
| `CLICKHOUSE_HOST` | `clickhouse` | ClickHouse server hostname |
| `CLICKHOUSE_PORT` | `9000` | ClickHouse native protocol port |
| `CLICKHOUSE_DB` | `default` | ClickHouse database name |
| `CLICKHOUSE_USER` | `default` | ClickHouse username |
| `CLICKHOUSE_PASSWORD` | `` | ClickHouse password |
| `BUFFER_SIZE` | `1000` | Max events before buffer flush |
| `FLUSH_INTERVAL` | `1` | Seconds between buffer flushes |
| `DEFAULT_PRICE_PER_1K` | `0.50` | Default price per 1000 AI requests (for revenue estimation) |
| `DEFAULT_PAY_THROUGH` | `1.0` | Default percentage of AI traffic that pays (0.0-1.0) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client SDKs                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Event Collector Service                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   HTTP API   │─▶│   Ingest     │─▶│     Classifier       │  │
│  │  (chi router)│  │   Service    │  │  (AI bot detection)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                                       │               │
│         │                                       ▼               │
│         │              ┌──────────────────────────────────┐    │
│         │              │        Event Buffer              │    │
│         │              │  (size/time-based flushing)      │    │
│         │              └──────────────────────────────────┘    │
│         │                                       │               │
│         ▼                                       ▼               │
│  ┌──────────────┐              ┌──────────────────────────┐    │
│  │    Auth      │              │    ClickHouse Storage    │    │
│  │  Middleware  │              │    (batch inserts)       │    │
│  └──────────────┘              └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ClickHouse                               │
│                    (ai_traffic_events table)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **HTTP API** (`/internal/api/`)
   - Chi router for request handling
   - Authentication middleware (Bearer token)
   - Request logging and size limiting
   - Health check endpoint

2. **Ingest Service** (`/internal/ingest/`)
   - Event validation
   - Timestamp parsing
   - UUID validation
   - Coordinates enrichment and buffering

3. **Classifier** (`/internal/classifier/`)
   - User-Agent pattern matching
   - AI vendor detection (OpenAI, Anthropic, Google, etc.)
   - Bot name extraction
   - Intent classification (training, search, user)
   - Confidence scoring

4. **Buffer** (`/internal/buffer/`)
   - In-memory event buffering
   - Size-based flushing (default: 1000 events)
   - Time-based flushing (default: 1 second)
   - Graceful shutdown with final flush

5. **Storage** (`/internal/storage/`)
   - ClickHouse batch inserts
   - Connection pooling
   - Schema management

## 🤖 AI Classification

The classifier detects the following AI vendors and bots:

| Vendor | Bot Name | User-Agent Patterns | Intent |
|--------|----------|---------------------|--------|
| OpenAI | GPTBot | `gptbot`, `chatgpt-user`, `oai-searchbot` | training |
| Anthropic | ClaudeBot | `claudebot`, `claude-web`, `anthropic` | training |
| Perplexity | PerplexityBot | `perplexitybot`, `perplexity` | search |
| Google | Googlebot | `googlebot`, `google-extended` | search |
| Common Crawl | CCBot | `ccbot`, `commoncrawl` | training |
| Cohere | CohereBot | `cohere-ai` | training |
| Meta | MetaBot | `meta-externalagent` | training |
| Bytedance | Bytespider | `bytespider`, `bytedance` | training |
| Amazon | Amazonbot | `amazonbot` | search |
| Apple | Applebot | `applebot` | search |

## 📊 ClickHouse Schema

```sql
CREATE TABLE IF NOT EXISTS ai_traffic_events (
  ts DateTime64(3),
  received_at DateTime64(3),

  version UInt8,
  event_type String,

  request_id UUID,
  nonce String,
  key_id String,
  project_id String,

  method String,
  pathname String,
  route String,

  ip String,
  user_agent String,
  referer String,

  is_ai UInt8,
  ai_vendor String,
  bot_name String,
  intent String,
  confidence String
)
ENGINE = MergeTree
PARTITION BY toDate(ts)
ORDER BY (project_id, route, ts);
```

### Query Examples

```sql
-- Count events by AI vendor
SELECT 
  ai_vendor, 
  count() as requests 
FROM ai_traffic_events 
WHERE is_ai = 1 
GROUP BY ai_vendor 
ORDER BY requests DESC;

-- AI vs human traffic ratio
SELECT 
  if(is_ai = 1, 'AI', 'Human') as traffic_type,
  count() as requests,
  round(count() * 100 / sum(count()) OVER (), 2) as percentage
FROM ai_traffic_events
GROUP BY is_ai;

-- Top routes accessed by AI bots
SELECT 
  route, 
  ai_vendor,
  count() as hits
FROM ai_traffic_events
WHERE is_ai = 1
GROUP BY route, ai_vendor
ORDER BY hits DESC
LIMIT 20;
```

## 🛠️ Development

### Project Structure

```
/lumen
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── api/
│   │   ├── handlers.go       # HTTP handlers
│   │   └── middleware.go     # Auth, logging, etc.
│   ├── buffer/
│   │   └── buffer.go         # Event buffering
│   ├── classifier/
│   │   └── classifier.go     # AI traffic classification
│   ├── config/
│   │   └── config.go         # Configuration loading
│   ├── ingest/
│   │   └── service.go        # Event processing
│   ├── models/
│   │   └── models.go         # Data structures
│   └── storage/
│       └── clickhouse.go     # ClickHouse client
├── Dockerfile
├── docker-compose.yml
├── go.mod
├── go.sum
└── README.md
```

### Build Locally

```bash
# Download dependencies
go mod download

# Build
go build -o collector ./cmd/server

# Run (requires ClickHouse)
INGEST_TOKEN=secret ./collector
```

### Run Tests

```bash
go test ./...
```

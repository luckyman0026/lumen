# API Reference

The Lumen dashboard consumes a REST API for AI traffic analytics. All API calls are made server-side via Next.js server actions.

## Authentication

All requests require an API key passed in the `X-API-Key` header.

```http
X-API-Key: your-api-key-here
```

## Base URL

```
https://backend.example.com/v1
```

Configurable via `API_URL` environment variable.

## Endpoints

### GET /overview

Returns aggregate traffic statistics for the specified time range.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `route` | string | No | Filter by specific route |
| `from` | ISO 8601 | No | Start of time range |
| `to` | ISO 8601 | No | End of time range |

**Response**

```json
{
  "total_requests": 150000,
  "ai_requests": 45000,
  "ai_share": 0.30
}
```

---

### GET /timeseries

Returns traffic data bucketed by time interval.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bucket` | string | No | Time bucket: `hour` or `day` (default: `hour`) |
| `limit` | number | No | Number of data points (default: 24) |
| `route` | string | No | Filter by specific route |
| `from` | ISO 8601 | No | Start of time range |
| `to` | ISO 8601 | No | End of time range |

**Response**

```json
[
  {
    "ts": "2025-01-02T10:00:00Z",
    "total": 5000,
    "ai": 1500
  },
  {
    "ts": "2025-01-02T11:00:00Z",
    "total": 5200,
    "ai": 1600
  }
]
```

---

### GET /top-routes

Returns routes ranked by AI request volume.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of routes (default: 10) |
| `route` | string | No | Filter by specific route |
| `from` | ISO 8601 | No | Start of time range |
| `to` | ISO 8601 | No | End of time range |

**Response**

```json
[
  {
    "route": "/api/products",
    "ai_requests": 12000
  },
  {
    "route": "/api/search",
    "ai_requests": 8500
  }
]
```

---

### GET /top-bots

Returns AI bots/operators ranked by request volume.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of bots (default: 10) |
| `route` | string | No | Filter by specific route |
| `from` | ISO 8601 | No | Start of time range |
| `to` | ISO 8601 | No | End of time range |

**Response**

```json
[
  {
    "ai_operator": "OpenAI",
    "ai_bot": "GPTBot",
    "requests": 25000
  },
  {
    "ai_operator": "Anthropic",
    "ai_bot": "ClaudeBot",
    "requests": 18000
  }
]
```

---

### POST /opportunity/estimate

Calculates estimated revenue based on route pricing.

**Request Body**

```json
{
  "from": "2025-01-01T00:00:00Z",
  "to": "2025-01-02T00:00:00Z",
  "route_prices": {
    "/api/products": 0.001,
    "/api/search": 0.002
  },
  "pay_through": 0.3,
  "ai_classes": ["training"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | ISO 8601 | Yes | Start of time range |
| `to` | ISO 8601 | Yes | End of time range |
| `route_prices` | object | Yes | Price per request by route |
| `pay_through` | number | No | Expected payment conversion rate |
| `ai_classes` | array | No | AI traffic classes to include |

**Response**

```json
{
  "ai_requests": 45000,
  "chargeable_requests": 13500,
  "estimated_revenue": {
    "low": 120.50,
    "mid": 185.00,
    "high": 250.75
  },
  "route_breakdown": [
    {
      "route": "/api/products",
      "ai_requests": 12000,
      "revenue": 80.00
    }
  ]
}
```

## Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Endpoint doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limits

[TODO: Document rate limits from backend team]

## Client Implementation

The dashboard implements API calls via server actions in `lib/actions.ts`. React Query hooks in `hooks/use-api.ts` provide:

- Automatic 10-second polling for real-time updates
- Request deduplication
- Caching with 30-second stale time
- Global filter context integration

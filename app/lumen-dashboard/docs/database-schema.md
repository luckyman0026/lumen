# Database Schema

The Lumen dashboard is a frontend application that consumes data from an external API backend. This document describes the data models used in the frontend and the expected schema from the API.

## Frontend Data Models

The dashboard uses TypeScript interfaces defined in `lib/actions.ts`:

### OverviewData

Aggregate traffic statistics.

```typescript
interface OverviewData {
  total_requests: number;  // Total HTTP requests in time range
  ai_requests: number;     // Requests from AI bots/crawlers
  ai_share: number;        // Ratio of AI to total (0-1)
}
```

### TimeseriesPoint

Time-bucketed traffic data for charts.

```typescript
interface TimeseriesPoint {
  ts: string;    // ISO 8601 timestamp
  total: number; // Total requests in bucket
  ai: number;    // AI requests in bucket
}
```

### TopRoute

Route-level traffic aggregation.

```typescript
interface TopRoute {
  route: string;       // URL path (e.g., "/api/products")
  ai_requests: number; // AI request count
}
```

### TopBot

AI bot/operator traffic data.

```typescript
interface TopBot {
  ai_operator: string; // Company name (e.g., "OpenAI")
  ai_bot: string;      // Bot name (e.g., "GPTBot")
  requests: number;    // Request count
}
```

### OpportunityEstimateResponse

Revenue estimation results.

```typescript
interface OpportunityEstimateResponse {
  ai_requests: number;
  chargeable_requests: number;
  estimated_revenue: {
    low: number;
    mid: number;
    high: number;
  };
  route_breakdown: RouteBreakdown[];
}

interface RouteBreakdown {
  route: string;
  ai_requests: number;
  revenue: number;
}
```

## ER Diagram

```
[Backend Database - Not directly accessed by frontend]

The dashboard queries pre-aggregated data from the API.
Backend schema details should be documented by the backend team.
```

## Backend Schema (Reference)

[TODO: The backend team should document the actual database schema here]

Expected tables (inferred from API responses):

| Table | Purpose |
|-------|---------|
| `requests` | Raw HTTP request logs with AI classification |
| `ai_operators` | Known AI operators and their bots |
| `routes` | Route definitions and metadata |

## Data Relationships

```
┌─────────────┐     ┌─────────────┐
│   routes    │────<│  requests   │
└─────────────┘     └──────┬──────┘
                          │
                          │ classified_by
                          ▼
                   ┌─────────────┐
                   │ai_operators │
                   └─────────────┘
```

## Indexing Strategy

[TODO: Backend team should document indexes]

Recommended indexes for the API's query patterns:
- `requests(timestamp)` - Time range queries
- `requests(route, timestamp)` - Route filtering
- `requests(ai_operator, ai_bot)` - Bot analytics

## Data Retention

[TODO: Document data retention policies from backend team]

## Caching

The frontend implements caching via React Query:

| Data | Stale Time | Refetch Interval |
|------|------------|------------------|
| Overview | 30s | 10s |
| Timeseries | 30s | 10s |
| Top Routes | 30s | 10s |
| Top Bots | 30s | 10s |
| Available Routes | 5m | 30s |

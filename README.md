# Lumen

**Lumen** is a comprehensive AI traffic analytics platform that tracks, classifies, and helps monetize AI bot traffic (GPTBot, ClaudeBot, PerplexityBot, etc.) across your web applications.

![Lumen Dashboard](https://via.placeholder.com/800x400?text=Lumen+Dashboard)

## ✨ Features

- 🤖 **AI Bot Detection** — Identifies 20+ AI crawlers including OpenAI, Anthropic, Google, Meta, and more
- 📊 **Real-time Analytics** — Live dashboard with 10-second polling for instant insights
- 🔥 **Fire-and-forget SDK** — Never blocks user requests, uses async event capture
- 💰 **Revenue Estimation** — Calculate potential revenue from licensing AI training data
- 🔐 **Secure by Design** — HMAC-SHA256 signed payloads with nonce protection
- ⚡ **High Throughput** — Buffered batch inserts to ClickHouse for scalability
- 🌐 **Edge-ready** — SDK works in Edge Runtime via Web Crypto API

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      YOUR APPLICATION                             │
│            (Next.js with @lumen/lumen-nextjs SDK)               │
│                       proxy.ts middleware                         │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HMAC-signed events (fire-and-forget)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                 LUMEN SERVER (Go)                             │
│  ┌─────────┐   ┌────────────┐   ┌────────┐   ┌─────────────────┐ │
│  │ Ingest  │ → │ Classifier │ → │ Buffer │ → │ ClickHouse      │ │
│  │   API   │   │ (20+ bots) │   │ (batch)│   │ (analytics DB)  │ │
│  └─────────┘   └────────────┘   └────────┘   └─────────────────┘ │
└────────────────────────┬─────────────────────────────────────────┘
                         │ REST API queries
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│               LUMEN DASHBOARD (Next.js 16)                    │
│  ┌──────────┐  ┌─────────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ Overview │  │ Time Series │  │Top Routes │  │  Top Bots    │  │
│  └──────────┘  └─────────────┘  └───────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Monorepo Structure

```
lumen/
├── docker-compose.yml          # Production-ready Docker setup
├── .env.example                # Environment configuration template
│
├── app/
│   ├── lumen-dashboard/ # Next.js 16 analytics dashboard
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   ├── hooks/              # React Query hooks
│   │   ├── lib/                # Utilities & server actions
│   │   └── docs/               # Dashboard documentation
│   │
│   └── lumen-server/    # Go backend collector
│       ├── cmd/server/         # Entry point
│       └── internal/           # Core modules
│           ├── api/            # HTTP handlers
│           ├── buffer/         # Event batching
│           ├── classifier/     # AI bot detection
│           ├── ingest/         # Event processing
│           ├── models/         # Data structures
│           └── storage/        # ClickHouse operations
│
└── packages/
    └── lumen-sdk/       # Client SDK monorepo
        └── packages/
            ├── lumen-core/    # Framework-agnostic core
            └── lumen-nextjs/  # Next.js adapter
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for SDK development)
- Go 1.22+ (for server development)
- pnpm (for SDK/dashboard)

### 1. Clone & Start Services

```bash
git clone https://github.com/lumen-org/Lumen.git
cd Lumen

# Start all services (server, dashboard, clickhouse)
docker compose up -d

# View logs
docker compose logs -f
```

### 2. Access the Dashboard

- **Dashboard**: http://localhost:3000
- **Server API**: http://localhost:8080
- **Server Health**: http://localhost:8080/health
- **ClickHouse**: http://localhost:8123

### 3. Integrate the SDK

```bash
pnpm add @lumen/lumen-nextjs
```

Create `proxy.ts` in your Next.js app:

```typescript
import { createLumen } from '@lumen/lumen-nextjs';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

const tracker = createLumen({
  ingestUrl: process.env.LUMEN_INGEST_URL!,
  keyId: process.env.LUMEN_KEY_ID!,
  hmacSecret: process.env.LUMEN_HMAC_SECRET!,
  sampleRate: 0.1, // 10% sampling
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 📦 Components

### 🖥️ Lumen Dashboard

Real-time analytics dashboard built with Next.js 16.

| Technology | Purpose |
|------------|---------|
| Next.js 16 | App Router framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| Recharts | Data visualization |
| TanStack Query | Data fetching & caching |

**Pages:**
- `/` — Overview with stats, traffic chart, top routes/bots
- `/time-series` — Detailed traffic breakdown over time
- `/top-routes` — Route-level analytics with revenue estimation
- `/top-bots` — AI bot/operator traffic analysis

[📚 Dashboard Documentation](./app/lumen-dashboard/docs/)

---

### ⚙️ Lumen Server

High-throughput Go backend for event collection and analytics.

| Component | Purpose |
|-----------|---------|
| Chi Router | HTTP routing |
| ClickHouse | Analytics database |
| Event Buffer | Batch processing |
| AI Classifier | Bot detection |

**Detected AI Bots:**

| Vendor | Bots |
|--------|------|
| OpenAI | GPTBot, ChatGPT-User, OAI-SearchBot |
| Anthropic | ClaudeBot, Claude-Web |
| Google | Google-Extended, Gemini |
| Perplexity | PerplexityBot |
| Meta | Meta-ExternalAgent, FacebookBot |
| Amazon | Amazonbot, BedrockBot |
| Apple | Applebot-Extended |
| ByteDance | Bytespider |
| Common Crawl | CCBot |
| Cohere | CohereBot |
| DeepSeek | DeepSeekBot |
| *...and more* | |

[📚 Server Documentation](./app/lumen-server/docs/)

---

### 📡 Lumen SDK

Fire-and-forget client SDK for capturing request events.

```
@lumen/lumen-core   — Framework-agnostic core
@lumen/lumen-nextjs — Next.js 15/16 adapter
```

**Features:**
- HMAC-SHA256 payload signing
- Deterministic sampling (consistent across distributed systems)
- Edge Runtime compatible (Web Crypto API)
- Never blocks user requests

[📚 SDK Documentation](./packages/lumen-sdk/)

---

## 🔌 API Reference

### Authentication

All endpoints require `X-API-Key` header:

```bash
curl -H "X-API-Key: your-token" http://localhost:8080/v1/overview
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/v1/events` | Ingest event batch (1-5000 events) |
| `GET` | `/v1/overview` | Aggregate traffic stats |
| `GET` | `/v1/timeseries` | Time-bucketed traffic data |
| `GET` | `/v1/top-routes` | Route rankings by AI traffic |
| `GET` | `/v1/top-bots` | Bot rankings by request count |
| `GET` | `/v1/routes` | Available routes list |
| `GET` | `/v1/route-prices` | Saved route pricing |
| `POST` | `/v1/opportunity/estimate` | Revenue estimation |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | ISO 8601 | Start time filter |
| `to` | ISO 8601 | End time filter |
| `route` | string | Filter by route path |

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `INGEST_TOKEN` | `your-secret-token-here` | API authentication token |
| `CLICKHOUSE_HOST` | `clickhouse` | ClickHouse hostname |
| `CLICKHOUSE_PORT` | `9000` | ClickHouse native port |
| `CLICKHOUSE_DB` | `default` | Database name |
| `BUFFER_SIZE` | `1000` | Events before flush |
| `FLUSH_INTERVAL` | `1` | Seconds between flushes |
| `API_URL` | `http://server:8080/v1` | Dashboard API URL |
| `API_KEY` | (same as INGEST_TOKEN) | Dashboard API key |

### Generate Secure Token

```bash
openssl rand -base64 32
```

---

## 🐳 Docker Deployment

### Local Development

```bash
# Start core services (server, dashboard, clickhouse)
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f server dashboard
```

### Production (with Traefik)

```bash
# Start all services including Traefik reverse proxy
docker compose --profile production up -d
```

**Production URLs** (configure DNS first):
- Dashboard: `https://lumen.example.com`
- API: `https://api.lumen.example.com`

### Stop Services

```bash
docker compose down

# Remove volumes too
docker compose down -v
```

---

## 🗄️ Database Schema

### `ai_traffic_events` (ClickHouse)

```sql
CREATE TABLE ai_traffic_events (
  ts DateTime64(3),              -- Event timestamp
  received_at DateTime64(3),     -- Server received time
  request_id UUID,               -- Unique request ID
  method String,                 -- HTTP method
  pathname String,               -- URL path
  route String,                  -- Normalized route
  ip String,                     -- Client IP
  user_agent String,             -- Raw User-Agent
  
  -- AI Classification
  is_ai UInt8,                   -- 1 if AI bot, 0 otherwise
  ai_vendor String,              -- "openai", "anthropic", etc.
  bot_name String,               -- "GPTBot", "ClaudeBot", etc.
  intent String,                 -- "training", "search", etc.
  confidence String              -- Classification confidence
)
ENGINE = MergeTree
PARTITION BY toDate(ts)
ORDER BY (project_id, route, ts)
```

---

## 🧪 Development

### Dashboard

```bash
cd app/lumen-dashboard
pnpm install
pnpm dev
```

### Server

```bash
cd app/lumen-server
go run ./cmd/server
```

### SDK

```bash
cd packages/lumen-sdk
pnpm install
pnpm build
```

---

## 📈 Revenue Estimation

Lumen helps estimate potential revenue from AI traffic monetization:

1. **Set Route Prices** — Define $/1K requests per route
2. **View Estimates** — See projected revenue at different pay-through rates
3. **Track Over Time** — Monitor AI traffic trends

Example: If `/api/products` receives 100K AI requests/month at $5/1K:
- **Low estimate (10% pay-through)**: $50/month
- **Mid estimate (50% pay-through)**: $250/month  
- **High estimate (100% pay-through)**: $500/month

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [ClickHouse](https://clickhouse.com/) — Lightning-fast analytics database
- [Next.js](https://nextjs.org/) — React framework
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful UI components
- [Recharts](https://recharts.org/) — Composable charting library
- [Chi](https://github.com/go-chi/chi) — Lightweight Go router

---

<p align="center">
  Built with ❤️ for the AI era
</p>

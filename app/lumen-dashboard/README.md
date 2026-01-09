# Lumen Dashboard

Real-time analytics dashboard for monitoring AI bot traffic across your web routes. Visualizes traffic patterns, identifies top AI crawlers (GPTBot, ClaudeBot, etc.), and estimates potential revenue from AI traffic monetization.

## Prerequisites

- Node.js 20+
- pnpm
- API credentials (API_URL and API_KEY)

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd lumen-dashboard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API credentials

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Data Fetching**: TanStack React Query
- **Icons**: Hugeicons (free)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |

## Documentation

### [Architecture Overview](docs/architecture/overview.md)
System design covering Next.js 16 App Router, React Query polling, server actions, and the four main pages (Overview, Time Series, Top Routes, Top Bots).

### [API Reference](docs/api.md)
REST API documentation for `/overview`, `/timeseries`, `/top-routes`, `/top-bots`, and `/opportunity/estimate` endpoints with request/response formats.

### [Database Schema](docs/database-schema.md)
TypeScript interfaces for OverviewData, TimeseriesPoint, TopRoute, TopBot, and OpportunityEstimateResponse.

### [Environment Guide](docs/environment.md)
Setup for API_URL and API_KEY environment variables across local, staging, and production environments.

### [Testing Guide](docs/testing.md)
Recommended testing stack (Vitest + Testing Library), example tests, and CI integration setup.

### [ADRs](docs/adr/)
Architecture Decision Records template for documenting technical decisions.

### [Runbooks](docs/runbooks/)
- [Deployment](docs/runbooks/deployment.md) - Build, deploy, and rollback procedures
- [Incident Response](docs/runbooks/incident-response.md) - Severity levels, diagnostics, and post-mortems

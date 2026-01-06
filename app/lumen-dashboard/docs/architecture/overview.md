# Architecture Overview

Lumen is a Next.js 16 dashboard for visualizing and analyzing AI bot traffic patterns across web routes. The frontend consumes a REST API backend for real-time traffic analytics.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Lumen Dashboard                    │
│                         (Next.js 16 App)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │  Overview   │  │ Time Series │  │ Top Routes  │  │Top Bots ││
│  │    Page     │  │    Page     │  │    Page     │  │  Page   ││
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘│
│         │                │                │               │     │
│         └────────────────┴────────────────┴───────────────┘     │
│                                  │                               │
│                    ┌─────────────┴─────────────┐                │
│                    │     React Query Hooks     │                │
│                    │      (10s polling)        │                │
│                    └─────────────┬─────────────┘                │
│                                  │                               │
│                    ┌─────────────┴─────────────┐                │
│                    │     Server Actions        │                │
│                    │    (lib/actions.ts)       │                │
│                    └─────────────┬─────────────┘                │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                          HTTPS + X-API-Key
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Traffic Backend API                        │
│              (https://backend.example.com)           │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Pages (App Router)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Overview | Dashboard home with stats, traffic chart, top routes/bots |
| `/time-series` | TimeSeriesPage | Detailed traffic breakdown over time |
| `/top-routes` | TopRoutesPage | Route-level analytics with revenue estimation |
| `/top-bots` | TopBotsPage | Bot/operator traffic analysis |

### Data Flow

1. **Filter Context** (`lib/filter-context.tsx`) - Global state for route and time range filters
2. **React Query Hooks** (`hooks/use-api.ts`) - Data fetching with 10-second polling intervals
3. **Server Actions** (`lib/actions.ts`) - API calls executed server-side with authentication
4. **UI Components** - Recharts visualizations with shadcn/ui components

### Key Design Patterns

- **Server Actions**: All API calls go through Next.js server actions for secure credential handling
- **Real-time Updates**: React Query polling every 10 seconds for live data
- **Context Providers**: Global filter state shared via React Context
- **Component Composition**: Reusable UI primitives from shadcn/ui and Radix

## Third-Party Integrations

| Service | Purpose | Configuration |
|---------|---------|---------------|
| AI Traffic Backend API | Traffic analytics data | `API_URL`, `API_KEY` env vars |
| Vercel | Hosting (recommended) | Automatic Next.js deployment |

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI primitives
- **Charts**: Recharts 2.15
- **Data Fetching**: TanStack React Query 5
- **Icons**: Hugeicons (free)
- **Date Handling**: date-fns 4

## Directory Structure

```
lumen-dashboard/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Overview dashboard
│   ├── layout.tsx         # Root layout with providers
│   ├── time-series/       # Time series analysis page
│   ├── top-routes/        # Top routes analysis page
│   └── top-bots/          # Top bots analysis page
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── overview/         # Overview page components
│   ├── time-series/      # Time series components
│   ├── top-routes/       # Top routes components
│   ├── top-bots/         # Top bots components
│   └── common/           # Shared components
├── hooks/                 # Custom React hooks
│   └── use-api.ts        # React Query data hooks
├── lib/                   # Utilities and context
│   ├── actions.ts        # Server actions (API calls)
│   ├── filter-context.tsx # Global filter state
│   └── utils.ts          # Helper functions
└── styles/               # Global CSS
```

## Security Considerations

- API keys are stored as environment variables and never exposed to the client
- All API calls are made server-side via Next.js server actions
- HTTPS required for production deployments

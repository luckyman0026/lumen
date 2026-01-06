# Testing Guide

## Current State

This project currently does not have a test suite configured. This guide documents the recommended approach for adding tests.

## Running Tests

[TODO: Configure test framework]

```bash
# Once configured:
pnpm test        # Run all tests
pnpm test:watch  # Run tests in watch mode
pnpm test:cov    # Run tests with coverage
```

## Testing Philosophy

### Recommended Approach

1. **Component Tests**: Test React components in isolation
2. **Integration Tests**: Test page-level functionality
3. **API Mocking**: Mock server actions for predictable test data
4. **E2E Tests**: Test critical user flows end-to-end

### What to Test

| Priority | Area | Examples |
|----------|------|----------|
| High | Data display | Charts render with data, tables show correct rows |
| High | User interactions | Filters update correctly, navigation works |
| Medium | Error states | Loading states, error messages, empty states |
| Low | Styling | Visual regression tests if needed |

## Coverage Expectations

Recommended coverage targets:

| Type | Target |
|------|--------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

## Writing New Tests

### Recommended Stack

```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Example Component Test

```typescript
// components/overview/__tests__/stat-card.test.tsx
import { render, screen } from '@testing-library/react';
import { StatCard } from '../stat-card';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard label="Total Requests" value={1000} />);

    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<StatCard label="Total Requests" loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### Example Hook Test

```typescript
// hooks/__tests__/use-api.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOverview } from '../use-api';

// Mock server action
vi.mock('@/lib/actions', () => ({
  getOverview: vi.fn().mockResolvedValue({
    total_requests: 1000,
    ai_requests: 300,
    ai_share: 0.3,
  }),
}));

describe('useOverview', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );

  it('fetches overview data', async () => {
    const { result } = renderHook(() => useOverview(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data.total_requests).toBe(1000);
  });
});
```

## Mocking Conventions

### Server Actions

```typescript
// Mock all actions
vi.mock('@/lib/actions');

// Mock specific responses
import { getOverview } from '@/lib/actions';
vi.mocked(getOverview).mockResolvedValue({
  total_requests: 1000,
  ai_requests: 300,
  ai_share: 0.3,
});
```

### Filter Context

```typescript
// Create test wrapper with filter context
const TestWrapper = ({ children }) => (
  <FilterProvider>
    {children}
  </FilterProvider>
);
```

### React Query

```typescript
// Create fresh query client per test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
```

## E2E Testing (Future)

For end-to-end testing, consider Playwright:

```bash
pnpm add -D @playwright/test
```

```typescript
// e2e/overview.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads with data', async ({ page }) => {
  await page.goto('/');

  // Wait for data to load
  await expect(page.getByText('Total Requests')).toBeVisible();
  await expect(page.getByText('AI Requests')).toBeVisible();
});

test('filter by route', async ({ page }) => {
  await page.goto('/');

  // Open route selector
  await page.getByRole('combobox').click();
  await page.getByText('/api/products').click();

  // Verify filter applied
  await expect(page.url()).toContain('route=');
});
```

## CI Integration

Add to GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm test
```

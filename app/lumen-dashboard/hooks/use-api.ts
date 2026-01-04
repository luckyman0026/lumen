// React Query hooks for API data fetching with polling

import {
  type FilterParams,
  type OpportunityEstimateResponse,
  type OverviewData,
  type TimeseriesPoint,
  type TopBot,
  type TopRoute,
  getAvailableRoutes,
  getOpportunityEstimate,
  getOverview,
  getTimeseries,
  getTopBots,
  getTopRoutes,
} from "@/lib/actions";
import {
  type TimeRange,
  getTimeRangeDates,
  useFilters,
} from "@/lib/filter-context";
import { useQuery } from "@tanstack/react-query";

const POLLING_INTERVAL = 10000; // 10 seconds

// Cache keys for React Query
export const queryKeys = {
  overview: (timeRange: TimeRange, route: string | null) =>
    ["overview", timeRange, route] as const,
  timeseries: (timeRange: TimeRange, limit: number, route: string | null) =>
    ["timeseries", timeRange, limit, route] as const,
  topRoutes: (timeRange: TimeRange, limit: number, route: string | null) =>
    ["top-routes", timeRange, limit, route] as const,
  topBots: (timeRange: TimeRange, limit: number, route: string | null) =>
    ["top-bots", timeRange, limit, route] as const,
  availableRoutes: ["available-routes"] as const,
  opportunityEstimate: (timeRange: TimeRange, prices: Record<string, number>) =>
    ["opportunity-estimate", timeRange, prices] as const,
};

// All hooks auto-apply current filter context and poll every 10s

export function useOverview() {
  const { route, timeRange } = useFilters();

  return useQuery<OverviewData>({
    queryKey: queryKeys.overview(timeRange, route),
    queryFn: () => {
      const { from, to } = getTimeRangeDates(timeRange);
      const filters: FilterParams = {
        route,
        from: from.toISOString(),
        to: to.toISOString(),
      };
      return getOverview(filters);
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useTimeseries(limit = 24) {
  const { route, timeRange } = useFilters();

  return useQuery<TimeseriesPoint[]>({
    queryKey: queryKeys.timeseries(timeRange, limit, route),
    queryFn: () => {
      const { from, to } = getTimeRangeDates(timeRange);
      const filters: FilterParams = {
        route,
        from: from.toISOString(),
        to: to.toISOString(),
      };
      return getTimeseries("hour", limit, filters);
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useTopRoutes(limit = 10) {
  const { route, timeRange } = useFilters();

  return useQuery<TopRoute[]>({
    queryKey: queryKeys.topRoutes(timeRange, limit, route),
    queryFn: () => {
      const { from, to } = getTimeRangeDates(timeRange);
      const filters: FilterParams = {
        route,
        from: from.toISOString(),
        to: to.toISOString(),
      };
      return getTopRoutes(limit, filters);
    },
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useTopBots(limit = 10) {
  const { route, timeRange } = useFilters();

  return useQuery<TopBot[]>({
    queryKey: queryKeys.topBots(timeRange, limit, route),
    queryFn: () => {
      const { from, to } = getTimeRangeDates(timeRange);
      const filters: FilterParams = {
        route,
        from: from.toISOString(),
        to: to.toISOString(),
      };
      return getTopBots(limit, filters);
    },
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useAvailableRoutes() {
  return useQuery<string[]>({
    queryKey: queryKeys.availableRoutes,
    queryFn: () => getAvailableRoutes(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
  });
}

// Only runs when prices are set (enabled: hasAnyPrices)
export function useOpportunityEstimate(prices: Record<string, number>) {
  const { timeRange } = useFilters();
  const hasAnyPrices = Object.keys(prices).length > 0;

  return useQuery<OpportunityEstimateResponse>({
    queryKey: queryKeys.opportunityEstimate(timeRange, prices),
    queryFn: () => {
      const { from, to } = getTimeRangeDates(timeRange);

      return getOpportunityEstimate({
        from: from.toISOString(),
        to: to.toISOString(),
        route_prices: prices,
        pay_through: 1,
      });
    },
    enabled: hasAnyPrices,
    staleTime: 30 * 1000, // 30 seconds
  });
}

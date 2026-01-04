"use server";

// API configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:8080/v1";
const API_KEY = process.env.API_KEY || "your-secret-token-here";

// Response types
export interface OverviewData {
	total_requests: number;
	ai_requests: number;
	ai_share: number;
	estimated_revenue?: {
		low: number;
		mid: number;
		high: number;
	};
}

export interface TimeseriesPoint {
	ts: string;
	total: number;
	ai: number;
}

export interface TopRoute {
	route: string;
	ai_requests: number;
}

export interface TopBot {
	ai_operator: string;
	ai_bot: string;
	requests: number;
}

// Generic fetch wrapper with auth
async function fetchAPI<T>(
	endpoint: string,
	params?: Record<string, string>,
): Promise<T> {
	const url = new URL(`${API_BASE_URL}/${endpoint}`);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.append(key, value);
		}
	}

	const res = await fetch(url.toString(), {
		headers: {
			"X-API-Key": API_KEY,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(`API error: ${res.status}`);
	}

	return res.json();
}

// Common filter params for all queries
export interface FilterParams {
	route?: string | null;
	from?: string;
	to?: string;
}

// Server actions for data fetching
export async function getOverview(filters?: FilterParams): Promise<OverviewData> {
	const params: Record<string, string> = {};
	if (filters?.route) params.route = filters.route;
	if (filters?.from) params.from = filters.from;
	if (filters?.to) params.to = filters.to;
	return fetchAPI<OverviewData>(
		"overview",
		Object.keys(params).length > 0 ? params : undefined,
	);
}

export async function getTimeseries(
	bucket: "hour" | "day" = "hour",
	limit = 24,
	filters?: FilterParams,
): Promise<TimeseriesPoint[]> {
	const params: Record<string, string> = {
		bucket,
		limit: limit.toString(),
	};
	if (filters?.route) params.route = filters.route;
	if (filters?.from) params.from = filters.from;
	if (filters?.to) params.to = filters.to;
	return fetchAPI<TimeseriesPoint[]>("timeseries", params);
}

export async function getTopRoutes(
	limit = 10,
	filters?: FilterParams,
): Promise<TopRoute[]> {
	const params: Record<string, string> = {
		limit: limit.toString(),
	};
	if (filters?.route) params.route = filters.route;
	if (filters?.from) params.from = filters.from;
	if (filters?.to) params.to = filters.to;
	return fetchAPI<TopRoute[]>("top-routes", params);
}

export async function getTopBots(
	limit = 10,
	filters?: FilterParams,
): Promise<TopBot[]> {
	const params: Record<string, string> = {
		limit: limit.toString(),
	};
	if (filters?.route) params.route = filters.route;
	if (filters?.from) params.from = filters.from;
	if (filters?.to) params.to = filters.to;
	return fetchAPI<TopBot[]>("top-bots", params);
}

// Extracts route names from top-routes response
export async function getAvailableRoutes(): Promise<string[]> {
	const routes = await fetchAPI<TopRoute[]>("top-routes", { limit: "100" });
	return routes.map((r) => r.route);
}

// Revenue estimate types
export interface OpportunityEstimateRequest {
	from: string;
	to: string;
	route_prices: Record<string, number>;
	pay_through?: number;
	ai_classes?: string[];
}

export interface RouteBreakdown {
	route: string;
	ai_requests: number;
	revenue: number;
}

export interface OpportunityEstimateResponse {
	ai_requests: number;
	chargeable_requests: number;
	estimated_revenue: {
		low: number;
		mid: number;
		high: number;
	};
	route_breakdown: RouteBreakdown[];
}

// Fetches saved route prices
export async function getRoutePrices(): Promise<Record<string, number>> {
	return fetchAPI<Record<string, number>>("route-prices");
}

// POST request - calculates revenue based on pricing
export async function getOpportunityEstimate(
	request: OpportunityEstimateRequest,
): Promise<OpportunityEstimateResponse> {
	const url = `${API_BASE_URL}/opportunity/estimate`;

	const res = await fetch(url, {
		method: "POST",
		headers: {
			"X-API-Key": API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(`API error: ${res.status}`);
	}

	return res.json();
}

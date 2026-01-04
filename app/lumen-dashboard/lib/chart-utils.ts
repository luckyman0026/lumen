// Chart configuration and calculation utilities

import type { ChartConfig } from "@/components/ui";

export { formatCompactNumber, formatYAxis } from "./format-utils";

export const CHART_COLORS = {
	ai: "hsl(43 96% 56%)",
	human: "hsl(160 60% 45%)",
	total: "hsl(220 70% 50%)",
} as const;

export const trafficChartConfig = {
	ai: {
		label: "AI Bots",
		color: CHART_COLORS.ai,
	},
	human: {
		label: "Human",
		color: CHART_COLORS.human,
	},
	total: {
		label: "Total Requests",
		color: CHART_COLORS.total,
	},
} satisfies ChartConfig;

// Compares first half vs second half of data to get % change
export function calculateTrend(data: { total: number }[]): number {
	if (data.length < 2) return 0;

	const midpoint = Math.floor(data.length / 2);
	const firstHalf = data.slice(0, midpoint);
	const secondHalf = data.slice(midpoint);

	const firstHalfTotal = firstHalf.reduce((sum, p) => sum + p.total, 0);
	const secondHalfTotal = secondHalf.reduce((sum, p) => sum + p.total, 0);

	return firstHalfTotal > 0
		? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
		: 0;
}

export function calculateAIPercentage(
	totalRequests: number,
	aiRequests: number,
): number {
	return totalRequests > 0 ? (aiRequests / totalRequests) * 100 : 0;
}

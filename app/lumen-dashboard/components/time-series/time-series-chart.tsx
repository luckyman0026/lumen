"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	Skeleton,
} from "@/components/ui";
import { useTimeseries } from "@/hooks/use-api";
import {
	CHART_COLORS,
	calculateAIPercentage,
	calculateTrend,
	trafficChartConfig,
} from "@/lib/chart-utils";
import { useFilters } from "@/lib/filter-context";
import { formatYAxis } from "@/lib/format-utils";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartStats, ChartStatsDisplay } from "./chart-stats-display";

function useChartData(limit: number) {
	const { data, isLoading, error } = useTimeseries(limit);

	const chartData = useMemo(() => {
		if (!data) return [];
		const timeFormat = "HH:mm";
		return data.map((point) => ({
			...point,
			time: format(parseISO(point.ts), timeFormat),
			human: point.total - point.ai,
		}));
	}, [data]);

	const stats = useMemo((): ChartStats | null => {
		if (!chartData || chartData.length < 2) return null;

		const totalRequests = chartData.reduce((sum, p) => sum + p.total, 0);
		const totalAI = chartData.reduce((sum, p) => sum + p.ai, 0);

		return {
			totalRequests,
			totalAI,
			aiPercentage: calculateAIPercentage(totalRequests, totalAI),
			trend: calculateTrend(chartData),
		};
	}, [chartData]);

	return { chartData, stats, isLoading, error, hasData: data && data.length > 0 };
}

export function TimeSeriesChart() {
	const { timeRange } = useFilters();
	const limit = timeRange === "last_hour" ? 60 : 24;
	const { chartData, stats, isLoading, error, hasData } = useChartData(limit);

	if (isLoading) {
		return <Skeleton className="h-[450px] w-full rounded-lg" />;
	}

	if (error || !hasData) {
		return (
			<div className="flex h-[450px] items-center justify-center text-muted-foreground rounded-lg border bg-card">
				No traffic data available
			</div>
		);
	}

	const description = timeRange === "last_hour" ? "Traffic from the last hour" : "Traffic from today";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Traffic Over Time</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					{stats && <ChartStatsDisplay stats={stats} />}
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={trafficChartConfig} className="h-[400px] w-full">
					<AreaChart
						data={chartData}
						margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
					>
						<defs>
							<linearGradient id="fillAI-ts" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={CHART_COLORS.ai} stopOpacity={0.4} />
								<stop offset="100%" stopColor={CHART_COLORS.ai} stopOpacity={0.05} />
							</linearGradient>
							<linearGradient id="fillHuman-ts" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={CHART_COLORS.human} stopOpacity={0.4} />
								<stop offset="100%" stopColor={CHART_COLORS.human} stopOpacity={0.05} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--border))"
						/>
						<XAxis
							dataKey="time"
							tickLine={false}
							axisLine={false}
							tickMargin={12}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							interval="preserveStartEnd"
							minTickGap={50}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={formatYAxis}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
							width={50}
						/>
						<ChartTooltip
							content={<ChartTooltipContent />}
							cursor={{
								stroke: "hsl(var(--muted-foreground))",
								strokeDasharray: "4 4",
							}}
						/>
						<ChartLegend content={<ChartLegendContent />} />
						<Area
							dataKey="human"
							type="monotone"
							fill="url(#fillHuman-ts)"
							stroke={CHART_COLORS.human}
							strokeWidth={2}
							stackId="1"
						/>
						<Area
							dataKey="ai"
							type="monotone"
							fill="url(#fillAI-ts)"
							stroke={CHART_COLORS.ai}
							strokeWidth={2}
							stackId="1"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

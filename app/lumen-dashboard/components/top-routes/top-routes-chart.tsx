"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Skeleton,
} from "@/components/ui";
import { useTopRoutes } from "@/hooks/use-api";
import { CHART_COLORS, formatCompactNumber } from "@/lib/chart-utils";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
	ai_requests: {
		label: "AI Requests",
		color: CHART_COLORS.ai,
	},
} satisfies ChartConfig;

export function TopRoutesChart() {
	const { data, isLoading, error } = useTopRoutes(15);

	const chartData = useMemo(() => {
		if (!data) return [];
		return data.map((item) => ({
			...item,
			shortRoute: item.route.length > 20
				? `${item.route.slice(0, 20)}...`
				: item.route,
		}));
	}, [data]);

	const stats = useMemo(() => {
		if (!data || data.length === 0) return null;
		const totalRequests = data.reduce((sum, r) => sum + r.ai_requests, 0);
		const topRoute = data[0];
		return { totalRequests, topRoute };
	}, [data]);

	// Fixed bar height (20px) + gap (8px) per item, plus padding
	const chartHeight = useMemo(() => {
		const itemCount = chartData.length || 1;
		return itemCount * 28 + 40;
	}, [chartData.length]);

	if (isLoading) {
		return <Skeleton className="h-[500px] w-full rounded-lg" />;
	}

	if (error || !data || data.length === 0) {
		return (
			<div className="flex h-[500px] items-center justify-center text-muted-foreground rounded-lg border bg-card">
				No route data available
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Routes by AI Traffic</CardTitle>
						<CardDescription>
							Top {data.length} routes receiving AI bot traffic
						</CardDescription>
					</div>
					{stats && (
						<div className="flex gap-6 text-sm">
							<div className="text-right">
								<p className="text-muted-foreground">Total AI Requests</p>
								<p className="text-sm font-medium">
									{stats.totalRequests.toLocaleString()}
								</p>
							</div>
							<div className="text-right">
								<p className="text-muted-foreground">Top Route</p>
								<p className="text-sm font-medium font-mono">
									{stats.topRoute.route}
								</p>
							</div>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
					<BarChart
						data={chartData}
						layout="vertical"
						margin={{ left: 0, right: 20, top: 10, bottom: 0 }}
						barCategoryGap={8}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={true}
							vertical={false}
							stroke="hsl(var(--border))"
						/>
						<XAxis
							type="number"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={formatCompactNumber}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
						/>
						<YAxis
							type="category"
							dataKey="shortRoute"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							width={150}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(_, payload) => {
										if (payload?.[0]?.payload?.route) {
											return payload[0].payload.route;
										}
										return "";
									}}
								/>
							}
							cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
						/>
						<Bar
							dataKey="ai_requests"
							fill={CHART_COLORS.ai}
							radius={[0, 4, 4, 0]}
							barSize={20}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

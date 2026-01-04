"use client";

import {
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
	formatYAxis,
	trafficChartConfig,
} from "@/lib/chart-utils";
import { useFilters } from "@/lib/filter-context";
import { format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function TrafficChart() {
	const { timeRange } = useFilters();
	const limit = timeRange === "last_hour" ? 60 : 24;
	const { data, isLoading, error } = useTimeseries(limit);

	if (isLoading) {
		return <Skeleton className="h-[350px] w-full rounded-lg" />;
	}

	if (error || !data || data.length === 0) {
		return (
			<div className="flex h-[350px] items-center justify-center text-muted-foreground rounded-lg border bg-card">
				No traffic data available
			</div>
		);
	}

	const timeFormat = timeRange === "last_hour" ? "HH:mm" : "HH:mm";
	const chartData = data.map((point) => ({
		...point,
		time: format(parseISO(point.ts), timeFormat),
		human: point.total - point.ai,
	}));

	return (
		<ChartContainer config={trafficChartConfig} className="h-[350px] w-full">
			<AreaChart
				data={chartData}
				margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
			>
				<defs>
					<linearGradient id="fillAI-overview" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={CHART_COLORS.ai} stopOpacity={0.4} />
						<stop offset="100%" stopColor={CHART_COLORS.ai} stopOpacity={0.05} />
					</linearGradient>
					<linearGradient id="fillHuman-overview" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={CHART_COLORS.human} stopOpacity={0.4} />
						<stop
							offset="100%"
							stopColor={CHART_COLORS.human}
							stopOpacity={0.05}
						/>
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
					tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
					fill="url(#fillHuman-overview)"
					stroke={CHART_COLORS.human}
					strokeWidth={2}
					stackId="1"
				/>
				<Area
					dataKey="ai"
					type="monotone"
					fill="url(#fillAI-overview)"
					stroke={CHART_COLORS.ai}
					strokeWidth={2}
					stackId="1"
				/>
			</AreaChart>
		</ChartContainer>
	);
}

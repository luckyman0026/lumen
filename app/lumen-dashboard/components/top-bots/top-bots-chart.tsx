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
import { useTopBots } from "@/hooks/use-api";
import { getBotChartColor } from "@/lib/constants/bot-colors";
import { formatCompactNumber } from "@/lib/format-utils";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

const chartConfig = {
	requests: {
		label: "Requests",
	},
} satisfies ChartConfig;

export function TopBotsChart() {
	const { data, isLoading, error } = useTopBots(12);

	const chartData = useMemo(() => {
		if (!data) return [];
		return data.map((item) => ({
			...item,
			color: getBotChartColor(item.ai_operator),
		}));
	}, [data]);

	const stats = useMemo(() => {
		if (!data || data.length === 0) return null;
		const totalRequests = data.reduce((sum, b) => sum + b.requests, 0);
		const uniqueOperators = new Set(data.map((b) => b.ai_operator)).size;
		const topBot = data[0];
		return { totalRequests, uniqueOperators, topBot };
	}, [data]);

	if (isLoading) {
		return <Skeleton className="h-[500px] w-full rounded-lg" />;
	}

	if (error || !data || data.length === 0) {
		return (
			<div className="flex h-[500px] items-center justify-center text-muted-foreground rounded-lg border bg-card">
				No bot data available
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle>Bots by Request Volume</CardTitle>
						<CardDescription>
							Top {data.length} AI bots crawling your site
						</CardDescription>
					</div>
					{stats && (
						<div className="flex gap-6 text-sm">
							<div className="text-right">
								<p className="text-muted-foreground">Total Requests</p>
								<p className="text-base font-medium">
									{stats.totalRequests.toLocaleString()}
								</p>
							</div>
							<div className="text-right">
								<p className="text-muted-foreground">Unique Operators</p>
								<p className="text-base font-medium">{stats.uniqueOperators}</p>
							</div>
							<div className="text-right">
								<p className="text-muted-foreground">Top Bot</p>
								<p className="text-base font-medium">{stats.topBot.ai_bot}</p>
							</div>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[420px] w-full">
					<BarChart
						data={chartData}
						layout="vertical"
						margin={{ left: 0, right: 20, top: 10, bottom: 0 }}
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
							dataKey="ai_bot"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							width={120}
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(_, payload) => {
										if (payload?.[0]?.payload) {
											const bot = payload[0].payload;
											return `${bot.ai_bot} (${bot.ai_operator})`;
										}
										return "";
									}}
								/>
							}
							cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
						/>
						<Bar dataKey="requests" radius={[0, 4, 4, 0]}>
							{chartData.map((entry) => (
								<Cell key={entry.ai_bot} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

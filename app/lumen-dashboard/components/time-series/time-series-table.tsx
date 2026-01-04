"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	TablePagination,
	TableSearch,
	TableToolbar,
} from "@/components/ui";
import { useTimeseries } from "@/hooks/use-api";
import { calculateAIPercentage } from "@/lib/chart-utils";
import { useFilters } from "@/lib/filter-context";
import { usePagination, useTableSearch } from "@/lib/table-utils";
import { format, parseISO } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { TimeSeriesTableRow } from "./time-series-table-row";

type AIFilterOption = "all" | "high" | "medium" | "low";

export function TimeSeriesTable() {
	const { timeRange } = useFilters();
	const limit = timeRange === "last_hour" ? 60 : 24;
	const { data, isLoading } = useTimeseries(limit);
	const [aiFilter, setAiFilter] = useState<AIFilterOption>("all");

	const timeFormat = "HH:mm";

	const processedData = useMemo(() => {
		if (!data) return [];
		return [...data].reverse().map((point) => ({
			...point,
			human: point.total - point.ai,
			aiPercent: calculateAIPercentage(point.total, point.ai),
			formattedTime: format(parseISO(point.ts), timeFormat),
		}));
	}, [data]);

	const filteredByAI = useMemo(() => {
		if (aiFilter === "all") return processedData;
		return processedData.filter((point) => {
			if (aiFilter === "high") return point.aiPercent > 60;
			if (aiFilter === "medium")
				return point.aiPercent >= 40 && point.aiPercent <= 60;
			return point.aiPercent < 40;
		});
	}, [processedData, aiFilter]);

	const searchFn = useCallback(
		(item: (typeof processedData)[0], query: string) => {
			return item.formattedTime.toLowerCase().includes(query);
		},
		[],
	);

	const { filteredItems, searchQuery, setSearchQuery } = useTableSearch(
		filteredByAI,
		searchFn,
	);

	const {
		items: paginatedItems,
		pagination,
		goToPage,
		changePageSize,
		canGoNext,
		canGoPrev,
	} = usePagination(filteredItems, { initialPageSize: 10 });

	if (isLoading) {
		return <Skeleton className="h-[400px] w-full rounded-lg" />;
	}

	if (!data || data.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Data Table</CardTitle>
				<CardDescription>
					Raw time series data for detailed analysis
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TableToolbar>
					<div className="flex items-center gap-3">
						<TableSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search by time..."
						/>
						<Select
							value={aiFilter}
							onValueChange={(v) => setAiFilter(v as AIFilterOption)}
						>
							<SelectTrigger className="h-10 w-[150px]">
								<SelectValue placeholder="AI Traffic" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Traffic</SelectItem>
								<SelectItem value="high">High AI (&gt;60%)</SelectItem>
								<SelectItem value="medium">Medium (40-60%)</SelectItem>
								<SelectItem value="low">Low AI (&lt;40%)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="text-sm text-muted-foreground">
						{filteredItems.length} results
					</div>
				</TableToolbar>

				<div className="rounded-md border overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/50 border-b">
								<th className="text-left p-3 font-medium">Time</th>
								<th className="text-right p-3 font-medium">Total</th>
								<th className="text-right p-3 font-medium">AI Bots</th>
								<th className="text-right p-3 font-medium">Human</th>
								<th className="text-right p-3 font-medium">AI %</th>
							</tr>
						</thead>
						<tbody>
							{paginatedItems.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="p-8 text-center text-muted-foreground"
									>
										No matching results
									</td>
								</tr>
							) : (
								paginatedItems.map((point, idx) => (
									<TimeSeriesTableRow
										key={point.ts}
										point={point}
										isEven={idx % 2 === 0}
									/>
								))
							)}
						</tbody>
					</table>
				</div>

				{filteredItems.length > 0 && (
					<TablePagination
						pagination={pagination}
						onPageChange={goToPage}
						onPageSizeChange={changePageSize}
						canGoNext={canGoNext}
						canGoPrev={canGoPrev}
					/>
				)}
			</CardContent>
		</Card>
	);
}

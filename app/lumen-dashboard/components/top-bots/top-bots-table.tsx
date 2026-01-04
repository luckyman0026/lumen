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
import { useTopBots } from "@/hooks/use-api";
import { usePagination, useTableSearch } from "@/lib/table-utils";
import { useCallback, useMemo, useState } from "react";
import { TopBotsTableRow } from "./top-bots-table-row";

type OperatorFilter =
	| "all"
	| "openai"
	| "anthropic"
	| "google"
	| "perplexity"
	| "apple"
	| "meta"
	| "amazon"
	| "other";

export function TopBotsTable() {
	const { data, isLoading } = useTopBots(50);
	const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>("all");

	const maxRequests = useMemo(() => {
		if (!data || data.length === 0) return 0;
		return Math.max(...data.map((b) => b.requests));
	}, [data]);

	const filteredByOperator = useMemo(() => {
		if (!data) return [];
		if (operatorFilter === "all") return data;
		if (operatorFilter === "other") {
			const knownOperators = [
				"openai",
				"anthropic",
				"google",
				"perplexity",
				"apple",
				"meta",
				"amazon",
			];
			return data.filter(
				(bot) => !knownOperators.includes(bot.ai_operator.toLowerCase()),
			);
		}
		return data.filter(
			(bot) => bot.ai_operator.toLowerCase() === operatorFilter,
		);
	}, [data, operatorFilter]);

	const searchFn = useCallback(
		(
			item: { ai_operator: string; ai_bot: string; requests: number },
			query: string,
		) => {
			return (
				item.ai_bot.toLowerCase().includes(query) ||
				item.ai_operator.toLowerCase().includes(query)
			);
		},
		[],
	);

	const { filteredItems, searchQuery, setSearchQuery } = useTableSearch(
		filteredByOperator,
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
				<CardTitle>Bot Details</CardTitle>
				<CardDescription>
					Complete list of AI bots with request counts
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TableToolbar>
					<div className="flex items-center gap-3">
						<TableSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search bots..."
						/>
						<Select
							value={operatorFilter}
							onValueChange={(v) => setOperatorFilter(v as OperatorFilter)}
						>
							<SelectTrigger className="h-10 w-[140px]">
								<SelectValue placeholder="Operator" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Operators</SelectItem>
								<SelectItem value="openai">OpenAI</SelectItem>
								<SelectItem value="anthropic">Anthropic</SelectItem>
								<SelectItem value="google">Google</SelectItem>
								<SelectItem value="perplexity">Perplexity</SelectItem>
								<SelectItem value="apple">Apple</SelectItem>
								<SelectItem value="meta">Meta</SelectItem>
								<SelectItem value="amazon">Amazon</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="text-sm text-muted-foreground">
						{filteredItems.length} bots
					</div>
				</TableToolbar>

				<div className="rounded-md border overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/50 border-b">
								<th className="text-left p-3 font-medium w-12">#</th>
								<th className="text-left p-3 font-medium">Bot</th>
								<th className="text-left p-3 font-medium">Operator</th>
								<th className="text-right p-3 font-medium">Requests</th>
								<th className="text-left p-3 font-medium w-48">Share</th>
							</tr>
						</thead>
						<tbody>
							{paginatedItems.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="p-8 text-center text-muted-foreground"
									>
										No matching bots
									</td>
								</tr>
							) : (
								paginatedItems.map((bot, idx) => (
									<TopBotsTableRow
										key={`${bot.ai_operator}-${bot.ai_bot}`}
										bot={bot}
										rank={(pagination.page - 1) * pagination.pageSize + idx + 1}
										maxRequests={maxRequests}
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

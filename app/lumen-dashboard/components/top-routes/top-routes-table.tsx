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
import { useTopRoutes } from "@/hooks/use-api";
import { usePagination, useTableSearch } from "@/lib/table-utils";
import { useCallback, useMemo, useState } from "react";
import { TopRoutesTableRow } from "./top-routes-table-row";

type RouteTypeFilter = "all" | "api" | "pages" | "docs";

export function TopRoutesTable() {
	const { data, isLoading } = useTopRoutes(10000);
	const [routeTypeFilter, setRouteTypeFilter] =
		useState<RouteTypeFilter>("all");

	const maxRequests = useMemo(() => {
		if (!data || data.length === 0) return 0;
		return Math.max(...data.map((r) => r.ai_requests));
	}, [data]);

	const filteredByType = useMemo(() => {
		if (!data) return [];
		if (routeTypeFilter === "all") return data;
		return data.filter((route) => {
			if (routeTypeFilter === "api") return route.route.startsWith("/api");
			if (routeTypeFilter === "docs") return route.route.includes("/docs");
			return !route.route.startsWith("/api") && !route.route.includes("/docs");
		});
	}, [data, routeTypeFilter]);

	const searchFn = useCallback(
		(item: { route: string; ai_requests: number }, query: string) => {
			return item.route.toLowerCase().includes(query);
		},
		[],
	);

	const { filteredItems, searchQuery, setSearchQuery } = useTableSearch(
		filteredByType,
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
				<CardTitle>Route Details</CardTitle>
				<CardDescription>
					Complete list of routes with AI bot traffic
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TableToolbar>
					<div className="flex items-center gap-3">
						<TableSearch
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search routes..."
						/>
						<Select
							value={routeTypeFilter}
							onValueChange={(v) => setRouteTypeFilter(v as RouteTypeFilter)}
						>
							<SelectTrigger className="h-10 w-[140px]">
								<SelectValue placeholder="Route Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Routes</SelectItem>
								<SelectItem value="api">API Routes</SelectItem>
								<SelectItem value="pages">Pages</SelectItem>
								<SelectItem value="docs">Docs</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="text-sm text-muted-foreground">
						{filteredItems.length} routes
					</div>
				</TableToolbar>

				<div className="rounded-md border overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/50 border-b">
								<th className="text-left p-3 font-medium w-12">#</th>
								<th className="text-left p-3 font-medium">Route</th>
								<th className="text-right p-3 font-medium">AI Requests</th>
								<th className="text-left p-3 font-medium w-48">Distribution</th>
								<th className="text-center p-3 font-medium w-32">Price / 1k</th>
							</tr>
						</thead>
						<tbody>
							{paginatedItems.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="p-8 text-center text-muted-foreground"
									>
										No matching routes
									</td>
								</tr>
							) : (
								paginatedItems.map((route, idx) => (
									<TopRoutesTableRow
										key={route.route}
										route={route}
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

"use client";

import { RouteSelector } from "@/components/common/route-selector";
import { TimeRangeToggle } from "@/components/common/time-range-toggle";
import { LiveIndicator } from "@/components/live-indicator";
import { Button } from "@/components/ui";
import { useAvailableRoutes } from "@/hooks/use-api";
import { useFilters } from "@/lib/filter-context";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface TopBotsFilterBarProps {
	title?: string;
	description?: string;
}

export function TopBotsFilterBar({
	title = "Top Bots",
	description = "AI bots crawling your site",
}: TopBotsFilterBarProps) {
	const { route, timeRange, setRoute, setTimeRange, clearFilters } = useFilters();
	const { data: routes, isLoading: routesLoading } = useAvailableRoutes();
	const [open, setOpen] = useState(false);

	const hasActiveFilters = route !== null || timeRange !== "today";

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-3">
					<h1 className="text-lg font-medium">{title}</h1>
					<LiveIndicator />
				</div>
				<span className="text-sm text-muted-foreground">{description}</span>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<RouteSelector
					route={route}
					routes={routes}
					isLoading={routesLoading}
					open={open}
					onOpenChange={setOpen}
					onRouteChange={setRoute}
				/>

				<TimeRangeToggle value={timeRange} onChange={setTimeRange} />

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="px-2 text-muted-foreground hover:text-foreground"
					>
						<HugeiconsIcon icon={Cancel01Icon} className="size-4" />
						Clear
					</Button>
				)}
			</div>
		</div>
	);
}

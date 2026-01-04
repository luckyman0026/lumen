"use client";

import { TimeRangeToggle } from "@/components/common/time-range-toggle";
import { LiveIndicator } from "@/components/live-indicator";
import {
	Button,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui";
import { useTopRoutes } from "@/hooks/use-api";
import { useFilters } from "@/lib/filter-context";
import { useRoutePrices } from "@/lib/route-prices-context";
import { Cancel01Icon, Dollar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";

interface TopRoutesFilterBarProps {
	title?: string;
	description?: string;
}

export function TopRoutesFilterBar({
	title = "Top Routes",
	description = "Most visited routes by AI bots",
}: TopRoutesFilterBarProps) {
	const { timeRange, setTimeRange, clearFilters } = useFilters();
	const { prices, setBulkPrices } = useRoutePrices();
	const { data } = useTopRoutes(10000);
	const [bulkPriceInput, setBulkPriceInput] = useState<string | null>(null);
	const [isBulkOpen, setIsBulkOpen] = useState(false);

	const hasActiveFilters = timeRange !== "today";
	const routeCount = data?.length ?? 0;

	const { uniformPrice, pricedCount } = useMemo(() => {
		if (!data || data.length === 0) return { uniformPrice: null, pricedCount: 0 };
		const pricesSet = data
			.map((item) => prices[item.route])
			.filter((p): p is number => p !== undefined);
		if (pricesSet.length === 0) return { uniformPrice: null, pricedCount: 0 };
		const firstPrice = pricesSet[0];
		const isUniform = pricesSet.every((p) => p === firstPrice);
		return {
			uniformPrice: isUniform ? firstPrice : null,
			pricedCount: pricesSet.length,
		};
	}, [data, prices]);

	const displayedPrice =
		bulkPriceInput !== null
			? bulkPriceInput
			: uniformPrice?.toFixed(2) ?? "";

	const handleBulkSave = () => {
		const value = Number.parseFloat(displayedPrice);
		if (!Number.isNaN(value) && value > 0 && data && data.length > 0) {
			const routes = data.map((item) => item.route);
			setBulkPrices(routes, value);
			setIsBulkOpen(false);
			setBulkPriceInput(null);
		}
	};

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
				<Popover
					open={isBulkOpen}
					onOpenChange={(open) => {
						setIsBulkOpen(open);
						if (!open) setBulkPriceInput(null);
					}}
				>
					<PopoverTrigger asChild>
						{uniformPrice !== null ? (
							<Button variant="outline" size="sm" className="h-10 gap-1.5">
								<HugeiconsIcon icon={Dollar01Icon} className="size-4" />
								<span className="text-green-600 dark:text-green-500 font-medium">
									${uniformPrice.toFixed(2)}/1k
								</span>
								<span className="text-xs text-muted-foreground">
									({pricedCount === routeCount ? routeCount : `${pricedCount}/${routeCount}`} routes)
								</span>
							</Button>
						) : pricedCount > 0 ? (
							<Button variant="outline" size="sm" className="h-10 gap-1.5">
								<HugeiconsIcon icon={Dollar01Icon} className="size-4" />
								<span>Mixed prices</span>
								<span className="text-xs text-muted-foreground">
									({pricedCount}/{routeCount} routes)
								</span>
							</Button>
						) : (
							<Button variant="outline" size="sm" className="h-10 gap-1.5">
								<HugeiconsIcon icon={Dollar01Icon} className="size-4" />
								<span>Set a price</span>
								<span className="text-xs text-muted-foreground">
									({routeCount} routes)
								</span>
							</Button>
						)}
					</PopoverTrigger>
					<PopoverContent className="w-64 p-3" align="end">
						<div className="space-y-3">
							<div>
								<div className="text-sm font-medium">
									Set price for all routes
								</div>
								<div className="text-xs text-muted-foreground mt-1">
									Applies to {routeCount} route
									{routeCount !== 1 ? "s" : ""}
								</div>
							</div>
							<div className="flex gap-2">
								<div className="relative flex-1">
									<span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
										$
									</span>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={displayedPrice}
										onChange={(e) => setBulkPriceInput(e.target.value)}
										className="pl-5 h-8"
										onKeyDown={(e) => {
											if (e.key === "Enter") handleBulkSave();
										}}
									/>
								</div>
								<Button size="sm" className="h-8" onClick={handleBulkSave}>
									Apply
								</Button>
							</div>
							<div className="text-xs text-muted-foreground">
								Price per 1,000 requests
							</div>
						</div>
					</PopoverContent>
				</Popover>

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

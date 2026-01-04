"use client";

import { Skeleton } from "@/components/ui";
import { useTopRoutes } from "@/hooks/use-api";
import { formatCompactNumber } from "@/lib/format-utils";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TopRoutesPanel() {
	const { data, isLoading, error } = useTopRoutes(9);

	const maxCount = data?.[0]?.ai_requests || 1;

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-medium text-sm text-foreground">Top Routes</h3>
			</div>

			<div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-2">
				<span>Route</span>
				<span>AI Requests</span>
			</div>

			<div className="space-y-1">
				{isLoading ? (
					["s1", "s2", "s3", "s4", "s5"].map((id) => (
						<div key={id} className="flex items-center justify-between p-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-12" />
						</div>
					))
				) : error || !data || data.length === 0 ? (
					<div className="text-sm text-muted-foreground p-2">
						No data available
					</div>
				) : (
					data.map((route) => {
						const percentage = (route.ai_requests / maxCount) * 100;
						return (
							<div
								key={route.route}
								className="relative flex items-center justify-between p-2 rounded group hover:bg-muted/50 transition-colors"
							>
								<div
									className="absolute inset-y-0 left-0 border border-amber-200 bg-amber-50 dark:bg-amber-950 rounded"
									style={{ width: `${percentage}%` }}
								/>
								<span className="relative text-sm font-medium truncate max-w-[70%]">
									{route.route}
								</span>
								<span className="relative text-sm text-default flex items-center gap-2">
									{formatCompactNumber(route.ai_requests)}
									<HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4 text-green-500" />
								</span>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

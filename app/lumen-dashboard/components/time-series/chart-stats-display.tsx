import { cn } from "@/lib/utils";
import { ArrowDownRight01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface ChartStats {
	totalRequests: number;
	totalAI: number;
	aiPercentage: number;
	trend: number;
}

interface ChartStatsDisplayProps {
	stats: ChartStats;
}

export function ChartStatsDisplay({ stats }: ChartStatsDisplayProps) {
	return (
		<div className="flex gap-6 text-sm">
			<div className="text-right">
				<p className="text-muted-foreground">Total Requests</p>
				<p className="text-base font-medium">
					{stats.totalRequests.toLocaleString()}
				</p>
			</div>
			<div className="text-right">
				<p className="text-muted-foreground">AI Traffic</p>
				<p className="text-base font-medium">{stats.aiPercentage.toFixed(1)}%</p>
			</div>
			<div className="text-right">
				<p className="text-muted-foreground">Trend</p>
				<p
					className={cn("text-base font-medium flex items-center justify-end gap-1", {
						"text-green-600 dark:text-green-500": stats.trend > 0,
						"text-red-600 dark:text-red-500": stats.trend < 0,
					})}
				>
					{stats.trend > 0 ? (
						<HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
					) : stats.trend < 0 ? (
						<HugeiconsIcon icon={ArrowDownRight01Icon} className="size-4" />
					) : null}
					{Math.abs(stats.trend).toFixed(1)}%
				</p>
			</div>
		</div>
	);
}

import { cn } from "@/lib/utils";

interface AIPercentageBadgeProps {
	percentage: number;
}

export function AIPercentageBadge({ percentage }: AIPercentageBadgeProps) {
	const badgeClass =
		percentage > 60
			? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
			: percentage > 40
				? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
				: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";

	return (
		<span className={cn("px-2 py-0.5 rounded text-xs font-medium", badgeClass)}>
			{percentage.toFixed(1)}%
		</span>
	);
}

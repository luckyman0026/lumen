import { cn } from "@/lib/utils";

interface StatCardProps {
	label: string;
	value: string | number;
	dateRange?: string;
	comparison?: {
		value: string | number;
		dateRange: string;
	};
	active?: boolean;
}

export function StatCard({
	label,
	value,
	dateRange,
	comparison,
	active = false,
}: StatCardProps) {
	return (
		<div className="flex flex-col gap-1">
			<span
				className={cn("text-xs font-medium tracking-wide", {
					"text-amber-600": active,
					"text-muted-foreground": !active,
				})}
			>
				{label}
			</span>
			<span className="text-2xl font-bold text-default">{value}</span>
			{dateRange && (
				<span className="text-xs text-muted-foreground">{dateRange}</span>
			)}
			{comparison && (
				<>
					<span className="text-lg font-medium text-muted-foreground mt-1">
						{comparison.value}
					</span>
					<span className="text-xs text-muted-foreground">
						{comparison.dateRange}
					</span>
				</>
			)}
		</div>
	);
}

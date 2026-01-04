import { cn } from "@/lib/utils";
import { AIPercentageBadge } from "./ai-percentage-badge";

export interface TimeSeriesDataPoint {
	ts: string;
	total: number;
	ai: number;
	human: number;
	aiPercent: number;
	formattedTime: string;
}

interface TimeSeriesTableRowProps {
	point: TimeSeriesDataPoint;
	isEven: boolean;
}

export function TimeSeriesTableRow({ point, isEven }: TimeSeriesTableRowProps) {
	return (
		<tr
			className={cn("border-b last:border-b-0 transition-colors", {
				"bg-background": isEven,
				"bg-muted/20": !isEven,
			})}
		>
			<td className="p-3 font-mono text-xs">{point.formattedTime}</td>
			<td className="p-3 text-right tabular-nums">
				{point.total.toLocaleString()}
			</td>
			<td className="p-3 text-right tabular-nums text-amber-600 dark:text-amber-500">
				{point.ai.toLocaleString()}
			</td>
			<td className="p-3 text-right tabular-nums text-emerald-600 dark:text-emerald-500">
				{point.human.toLocaleString()}
			</td>
			<td className="p-3 text-right">
				<AIPercentageBadge percentage={point.aiPercent} />
			</td>
		</tr>
	);
}

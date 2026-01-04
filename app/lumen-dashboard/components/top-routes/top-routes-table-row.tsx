import { cn } from "@/lib/utils";
import { RoutePriceCell } from "./route-price-cell";

export interface RouteData {
	route: string;
	ai_requests: number;
}

interface TopRoutesTableRowProps {
	route: RouteData;
	rank: number;
	maxRequests: number;
	isEven: boolean;
}

export function TopRoutesTableRow({
	route,
	rank,
	maxRequests,
	isEven,
}: TopRoutesTableRowProps) {
	const percentage =
		maxRequests > 0 ? (route.ai_requests / maxRequests) * 100 : 0;

	return (
		<tr
			className={cn("border-b last:border-b-0 transition-colors", {
				"bg-background": isEven,
				"bg-muted/20": !isEven,
			})}
		>
			<td className="p-3 text-muted-foreground">{rank}</td>
			<td className="p-3 font-mono text-xs">{route.route}</td>
			<td className="p-3 text-right tabular-nums text-amber-600 dark:text-amber-500">
				{route.ai_requests.toLocaleString()}
			</td>
			<td className="p-3">
				<div className="flex items-center gap-2">
					<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-amber-500 rounded-full transition-all"
							style={{ width: `${percentage}%` }}
						/>
					</div>
					<span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
						{percentage.toFixed(0)}%
					</span>
				</div>
			</td>
			<td className="p-3 text-center">
				<RoutePriceCell route={route.route} />
			</td>
		</tr>
	);
}

import { BotIcon } from "@/components/icons/bot-icons";
import { getBotBadgeClasses } from "@/lib/constants/bot-colors";
import { cn } from "@/lib/utils";

export interface BotData {
	ai_operator: string;
	ai_bot: string;
	requests: number;
}

interface TopBotsTableRowProps {
	bot: BotData;
	rank: number;
	maxRequests: number;
	isEven: boolean;
}

export function TopBotsTableRow({
	bot,
	rank,
	maxRequests,
	isEven,
}: TopBotsTableRowProps) {
	const percentage = maxRequests > 0 ? (bot.requests / maxRequests) * 100 : 0;
	const badge = getBotBadgeClasses(bot.ai_operator);

	return (
		<tr
			className={cn("border-b last:border-b-0 transition-colors", {
				"bg-background": isEven,
				"bg-muted/20": !isEven,
			})}
		>
			<td className="p-3 text-muted-foreground">{rank}</td>
			<td className="p-3 font-medium">{bot.ai_bot}</td>
			<td className="p-3">
				<span
					className={cn(
						"inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium capitalize",
						badge.bg,
						badge.text,
					)}
				>
					<BotIcon operator={bot.ai_operator} className="size-3.5" />
					{bot.ai_operator}
				</span>
			</td>
			<td className="p-3 text-right tabular-nums font-medium">
				{bot.requests.toLocaleString()}
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
		</tr>
	);
}

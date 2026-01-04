"use client";

import { BotIcon } from "@/components/icons/bot-icons";
import { Skeleton } from "@/components/ui";
import { useTopBots } from "@/hooks/use-api";
import { getBotBadgeClasses } from "@/lib/constants/bot-colors";
import { formatCompactNumber } from "@/lib/format-utils";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function TopBotsPanel() {
	const { data, isLoading, error } = useTopBots(9);

	const maxCount = data?.[0]?.requests || 1;

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-medium text-sm text-foreground">Top AI Bots</h3>
			</div>

			<div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-2">
				<span>Bot</span>
				<span>Requests</span>
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
					data.map((bot) => {
						const percentage = (bot.requests / maxCount) * 100;
						const badge = getBotBadgeClasses(bot.ai_operator);
						return (
							<div
								key={`${bot.ai_operator}-${bot.ai_bot}`}
								className="relative flex items-center justify-between p-2 rounded group hover:bg-muted/50 transition-colors"
							>
								<div
									className="absolute inset-y-0 left-0 border border-amber-200 bg-amber-50 dark:bg-amber-950 rounded"
									style={{ width: `${percentage}%` }}
								/>
								<span className="relative text-sm font-medium truncate max-w-[70%] flex items-center gap-2">
									<span className="p-1 rounded border border-amber-200 bg-white">
										<BotIcon operator={bot.ai_operator} className="size-3.5" />
									</span>
									{bot.ai_bot}
								</span>
								<span className="relative text-sm text-default flex items-center gap-2">
									{formatCompactNumber(bot.requests)}
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

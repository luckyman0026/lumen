import { cn } from "@/lib/utils";
import { Dollar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface EstimateCardProps {
	label: string;
	value: number;
	variant: "primary" | "muted";
}

export function EstimateCard({ label, value, variant }: EstimateCardProps) {
	return (
		<div
			className={cn("rounded-lg p-3 text-center", {
				"bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800":
					variant === "primary",
				"bg-white border border-border": variant !== "primary",
			})}
		>
			<div className="text-xs text-muted-foreground">{label}</div>
			<div
				className={cn("text-xl font-bold flex items-center justify-center", {
					"text-green-600 dark:text-green-500": variant === "primary",
				})}
			>
				<HugeiconsIcon icon={Dollar01Icon} className="size-4" />
				{value.toFixed(2)}
			</div>
		</div>
	);
}

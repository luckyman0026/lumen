"use client";

import {
	Button,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui";
import { useRoutePrices } from "@/lib/route-prices-context";
import { Cancel01Icon, Dollar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface RoutePriceCellProps {
	route: string;
}

export function RoutePriceCell({ route }: RoutePriceCellProps) {
	const { prices, setPrice, removePrice } = useRoutePrices();
	const currentPrice = prices[route];
	const [priceInput, setPriceInput] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const displayedPrice =
		priceInput !== null ? priceInput : currentPrice?.toString() ?? "";

	const handleSave = () => {
		const value = Number.parseFloat(displayedPrice);
		if (!Number.isNaN(value) && value > 0) {
			setPrice(route, value);
			setIsOpen(false);
			setPriceInput(null);
		}
	};

	const handleRemove = () => {
		removePrice(route);
		setPriceInput(null);
		setIsOpen(false);
	};

	return (
		<Popover
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) setPriceInput(null);
			}}
		>
			<PopoverTrigger asChild>
				{currentPrice !== undefined ? (
					<Button
						variant="outline"
						size="sm"
						className="h-7 gap-1 text-xs font-medium"
					>
						<HugeiconsIcon icon={Dollar01Icon} className="size-3.5" />
						{currentPrice.toFixed(2)}
					</Button>
				) : (
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
					>
						<HugeiconsIcon icon={Dollar01Icon} className="size-3.5" />
						Add
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-56 p-3" align="end">
				<div className="space-y-3">
					<div className="text-sm font-medium">Price per 1k requests</div>
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
								onChange={(e) => setPriceInput(e.target.value)}
								className="pl-5 h-8"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSave();
								}}
							/>
						</div>
						<Button size="sm" className="h-8" onClick={handleSave}>
							Save
						</Button>
					</div>
					{currentPrice !== undefined && (
						<Button
							variant="ghost"
							size="sm"
							className="w-full h-7 text-xs text-muted-foreground hover:text-destructive"
							onClick={handleRemove}
						>
							<HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
							Remove price
						</Button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

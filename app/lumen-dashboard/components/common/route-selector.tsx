"use client";

import {
	Button,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ArrowUpDownIcon, Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface RouteSelectorProps {
	route: string | null;
	routes: string[] | undefined;
	isLoading: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onRouteChange: (route: string | null) => void;
}

export function RouteSelector({
	route,
	routes,
	isLoading,
	open,
	onOpenChange,
	onRouteChange,
}: RouteSelectorProps) {
	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					aria-expanded={open}
					className="w-[200px] justify-between text-sm font-normal"
				>
					{route || "All routes"}
					<HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search routes..." />
					<CommandList>
						<CommandEmpty>No route found.</CommandEmpty>
						<CommandGroup>
							<CommandItem
								value="all"
								onSelect={() => {
									onRouteChange(null);
									onOpenChange(false);
								}}
							>
								<HugeiconsIcon
									icon={Tick01Icon}
									className={cn("size-4", {
										"opacity-100": route === null,
										"opacity-0": route !== null,
									})}
								/>
								All routes
							</CommandItem>
							{isLoading ? (
								<CommandItem disabled>Loading...</CommandItem>
							) : (
								routes?.map((r) => (
									<CommandItem
										key={r}
										value={r}
										onSelect={() => {
											onRouteChange(r);
											onOpenChange(false);
										}}
									>
										<HugeiconsIcon
											icon={Tick01Icon}
											className={cn("size-4", {
												"opacity-100": route === r,
												"opacity-0": route !== r,
											})}
										/>
										{r}
									</CommandItem>
								))
							)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui";
import type { TimeRange } from "@/lib/filter-context";

interface TimeRangeToggleProps {
	value: TimeRange;
	onChange: (value: TimeRange) => void;
}

export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(newValue) => {
				if (newValue) onChange(newValue as TimeRange);
			}}
		>
			<ToggleGroupItem value="last_hour" aria-label="Last Hour" className="text-xs px-3">
				Last Hour
			</ToggleGroupItem>
			<ToggleGroupItem value="today" aria-label="Today" className="text-xs px-3">
				Today
			</ToggleGroupItem>
		</ToggleGroup>
	);
}

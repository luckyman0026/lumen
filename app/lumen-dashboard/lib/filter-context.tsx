"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

// Global filter state for route and time range selection

export type TimeRange = "last_hour" | "today";

interface FilterState {
	route: string | null;
	timeRange: TimeRange;
}

interface FilterContextType extends FilterState {
	setRoute: (route: string | null) => void;
	setTimeRange: (timeRange: TimeRange) => void;
	clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
	const [route, setRoute] = useState<string | null>(null);
	const [timeRange, setTimeRange] = useState<TimeRange>("today");

	const clearFilters = () => {
		setRoute(null);
		setTimeRange("today");
	};

	return (
		<FilterContext.Provider
			value={{ route, timeRange, setRoute, setTimeRange, clearFilters }}
		>
			{children}
		</FilterContext.Provider>
	);
}

export function useFilters() {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilters must be used within a FilterProvider");
	}
	return context;
}

// Converts time range to from/to timestamps
export function getTimeRangeDates(timeRange: TimeRange): { from: Date; to: Date } {
	const now = new Date();

	if (timeRange === "last_hour") {
		return {
			from: new Date(now.getTime() - 60 * 60 * 1000),
			to: now,
		};
	}

	const midnight = new Date(now);
	midnight.setHours(0, 0, 0, 0);
	return {
		from: midnight,
		to: now,
	};
}

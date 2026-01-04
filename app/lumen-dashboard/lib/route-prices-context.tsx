"use client";

import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

// State for route pricing (used in revenue estimation)

interface RoutePricesContextType {
	prices: Record<string, number>;
	setPrice: (route: string, price: number) => void;
	setBulkPrices: (routes: string[], price: number) => void;
	removePrice: (route: string) => void;
	clearPrices: () => void;
	initializePrices: (prices: Record<string, number>) => void;
	hasAnyPrices: boolean;
	isSidebarOpen: boolean;
	setIsSidebarOpen: (open: boolean) => void;
}

const RoutePricesContext = createContext<RoutePricesContextType | null>(null);

export function RoutePricesProvider({ children }: { children: ReactNode }) {
	const [prices, setPrices] = useState<Record<string, number>>({});
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const initializedRef = useRef(false);

	// Initialize with server-fetched prices (called once by RoutePricesHydrator)
	const initializePrices = useCallback((initialPrices: Record<string, number>) => {
		if (initializedRef.current) return;
		initializedRef.current = true;
		if (Object.keys(initialPrices).length > 0) {
			setPrices(initialPrices);
			setIsSidebarOpen(true);
		}
	}, []);

	// Auto-opens sidebar on first price set
	const setPrice = useCallback((route: string, price: number) => {
		setPrices((prev) => {
			const hadPrices = Object.keys(prev).length > 0;
			const next = { ...prev, [route]: price };
			if (!hadPrices) {
				setIsSidebarOpen(true);
			}
			return next;
		});
	}, []);

	const setBulkPrices = useCallback((routes: string[], price: number) => {
		setPrices((prev) => {
			const hadPrices = Object.keys(prev).length > 0;
			const next = { ...prev };
			for (const route of routes) {
				next[route] = price;
			}
			if (!hadPrices && routes.length > 0) {
				setIsSidebarOpen(true);
			}
			return next;
		});
	}, []);

	const removePrice = useCallback((route: string) => {
		setPrices((prev) => {
			const next = { ...prev };
			delete next[route];
			return next;
		});
	}, []);

	const clearPrices = useCallback(() => {
		setPrices({});
	}, []);

	const hasAnyPrices = Object.keys(prices).length > 0;

	return (
		<RoutePricesContext.Provider
			value={{
				prices,
				setPrice,
				setBulkPrices,
				removePrice,
				clearPrices,
				initializePrices,
				hasAnyPrices,
				isSidebarOpen,
				setIsSidebarOpen,
			}}
		>
			{children}
		</RoutePricesContext.Provider>
	);
}

export function useRoutePrices() {
	const context = useContext(RoutePricesContext);
	if (!context) {
		throw new Error("useRoutePrices must be used within a RoutePricesProvider");
	}
	return context;
}

// Hydrates context with server-fetched prices
export function RoutePricesHydrator({
	prices,
}: { prices: Record<string, number> }) {
	const { initializePrices } = useRoutePrices();

	// Must use useEffect to avoid setState during render
	useEffect(() => {
		initializePrices(prices);
	}, [initializePrices, prices]);

	return null;
}

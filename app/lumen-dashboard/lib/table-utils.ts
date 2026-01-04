// Table pagination and search utilities

import { useMemo, useState } from "react";

export interface PaginationState {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface UsePaginationOptions {
	initialPage?: number;
	initialPageSize?: number;
}

// Returns paginated items with navigation controls
export function usePagination<T>(
	items: T[],
	options: UsePaginationOptions = {},
) {
	const { initialPage = 1, initialPageSize = 10 } = options;
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);

	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / pageSize);

	const paginatedItems = useMemo(() => {
		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		return items.slice(start, end);
	}, [items, page, pageSize]);

	const goToPage = (newPage: number) => {
		setPage(Math.max(1, Math.min(newPage, totalPages)));
	};

	const nextPage = () => goToPage(page + 1);
	const prevPage = () => goToPage(page - 1);

	const changePageSize = (newSize: number) => {
		setPageSize(newSize);
		setPage(1);
	};

	return {
		items: paginatedItems,
		pagination: {
			page,
			pageSize,
			totalItems,
			totalPages,
		},
		goToPage,
		nextPage,
		prevPage,
		setPage,
		changePageSize,
		canGoNext: page < totalPages,
		canGoPrev: page > 1,
	};
}

// Filters items based on search query using custom match function
export function useTableSearch<T>(
	items: T[],
	searchFn: (item: T, query: string) => boolean,
) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items;
		const query = searchQuery.toLowerCase().trim();
		return items.filter((item) => searchFn(item, query));
	}, [items, searchQuery, searchFn]);

	return {
		filteredItems,
		searchQuery,
		setSearchQuery,
		hasSearch: searchQuery.trim().length > 0,
	};
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

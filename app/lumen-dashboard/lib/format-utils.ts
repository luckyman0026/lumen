// Number formatting utilities

// 1000 -> 1.0K, 1000000 -> 1.0M
export function formatCompactNumber(num: number): string {
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(1)}M`;
	}
	if (num >= 1_000) {
		return `${(num / 1_000).toFixed(1)}K`;
	}
	return num.toLocaleString();
}

// Lowercase 'k' for Y-axis labels
export function formatYAxis(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
	return value.toString();
}

export function formatPercentage(value: number): string {
	return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number, decimals = 2): string {
	return `$${value.toFixed(decimals)}`;
}

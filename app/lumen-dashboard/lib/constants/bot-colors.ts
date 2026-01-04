// Color definitions for AI bot operators (charts and badges)
export type BotOperator =
	| "openai"
	| "anthropic"
	| "google"
	| "perplexity"
	| "apple"
	| "cohere"
	| "commoncrawl"
	| "amazon"
	| "bytedance"
	| "meta"
	| "unknown";

// HSL colors for Recharts
export const BOT_CHART_COLORS: Record<BotOperator, string> = {
	openai: "hsl(152 76% 36%)",
	anthropic: "hsl(24 94% 50%)",
	google: "hsl(217 91% 60%)",
	perplexity: "hsl(280 68% 60%)",
	apple: "hsl(0 0% 45%)",
	cohere: "hsl(340 75% 55%)",
	commoncrawl: "hsl(43 74% 49%)",
	amazon: "hsl(33 100% 50%)",
	bytedance: "hsl(180 70% 45%)",
	meta: "hsl(214 89% 52%)",
	unknown: "hsl(215 16% 47%)",
};

// Tailwind classes for badges
export const BOT_BADGE_CLASSES: Record<BotOperator, { bg: string; text: string }> = {
	openai: { bg: "bg-emerald-100", text: "text-emerald-800" },
	anthropic: { bg: "bg-orange-100", text: "text-orange-800" },
	google: { bg: "bg-blue-100", text: "text-blue-800" },
	perplexity: { bg: "bg-purple-100", text: "text-purple-800" },
	apple: { bg: "bg-gray-100", text: "text-gray-800" },
	cohere: { bg: "bg-pink-100", text: "text-pink-800" },
	commoncrawl: { bg: "bg-amber-100", text: "text-amber-800" },
	amazon: { bg: "bg-yellow-100", text: "text-yellow-800" },
	bytedance: { bg: "bg-cyan-100", text: "text-cyan-800" },
	meta: { bg: "bg-indigo-100", text: "text-indigo-800" },
	unknown: { bg: "bg-slate-100", text: "text-slate-800" },
};

export function getBotChartColor(operator: string): string {
	const key = operator.toLowerCase() as BotOperator;
	return BOT_CHART_COLORS[key] ?? BOT_CHART_COLORS.unknown;
}

export function getBotBadgeClasses(operator: string): { bg: string; text: string } {
	const key = operator.toLowerCase() as BotOperator;
	return BOT_BADGE_CLASSES[key] ?? BOT_BADGE_CLASSES.unknown;
}

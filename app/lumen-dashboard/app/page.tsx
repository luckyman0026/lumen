import { FilterBar } from "@/components/filter-bar";
import { OverviewStats } from "@/components/overview/overview-stats";
import { TopBotsPanel } from "@/components/overview/top-bots-panel";
import { TopRoutesPanel } from "@/components/overview/top-routes-panel";
import { TrafficChart } from "@/components/overview/traffic-chart";
import { getRoutePrices } from "@/lib/actions";
import { RoutePricesHydrator } from "@/lib/route-prices-context";

export default async function Page() {
	let savedPrices: Record<string, number> = {};
	try {
		savedPrices = await getRoutePrices();
	} catch {
		// No saved prices or API unavailable
	}

	return (
		<main className="max-w-[1100px] w-full mx-auto py-8 px-6 space-y-6">
			<RoutePricesHydrator prices={savedPrices} />
			<FilterBar />

			<div className="bg-card rounded-lg border p-6">
				<OverviewStats />
			</div>

			<div className="bg-card rounded-lg border p-6">
				<TrafficChart />
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-card rounded-lg border p-6">
					<TopRoutesPanel />
				</div>
				<div className="bg-card rounded-lg border p-6">
					<TopBotsPanel />
				</div>
			</div>
		</main>
	);
}

import {
  OpportunityEstimateLayout,
  TopRoutesChart,
  TopRoutesFilterBar,
  TopRoutesTable,
} from "@/components/top-routes";
import { getRoutePrices } from "@/lib/actions";
import { RoutePricesHydrator } from "@/lib/route-prices-context";

export default async function TopRoutesPage() {
  let savedPrices: Record<string, number> = {};
  try {
    savedPrices = await getRoutePrices();
  } catch {
    // No saved prices or API unavailable
  }

  return (
    <OpportunityEstimateLayout>
      <RoutePricesHydrator prices={savedPrices} />
      <main className="max-w-[1100px] w-full mx-auto py-8 px-6 space-y-6">
        <TopRoutesFilterBar />
        <TopRoutesTable />
        <TopRoutesChart />
      </main>
    </OpportunityEstimateLayout>
  );
}

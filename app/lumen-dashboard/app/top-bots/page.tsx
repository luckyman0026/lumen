import {
	TopBotsChart,
	TopBotsFilterBar,
	TopBotsTable,
} from "@/components/top-bots";

export default function TopBotsPage() {
	return (
		<main className="max-w-[1100px] w-full mx-auto py-8 px-6 space-y-6">
			<TopBotsFilterBar />
			<TopBotsChart />
			<TopBotsTable />
		</main>
	);
}

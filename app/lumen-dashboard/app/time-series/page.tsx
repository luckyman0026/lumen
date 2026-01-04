import {
	TimeSeriesChart,
	TimeSeriesFilterBar,
	TimeSeriesTable,
} from "@/components/time-series";

export default function TimeSeriesPage() {
	return (
		<main className="max-w-[1100px] w-full mx-auto py-8 px-6 space-y-6">
			<TimeSeriesFilterBar />
			<TimeSeriesChart />
			<TimeSeriesTable />
		</main>
	);
}

import { CodeExampleSection, Footer, Header, HeroSection } from "../components";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-zinc-50">
			<Header />
			<main className="min-h-screen">
				<HeroSection />
				<CodeExampleSection />
			</main>
			<Footer />
		</div>
	);
}

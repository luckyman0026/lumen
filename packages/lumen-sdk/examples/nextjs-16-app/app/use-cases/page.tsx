import { Footer, H2, H3, Header, LI, P, ProseLayout, UL } from "../../components";

export default function UseCasesPage() {
	return (
		<div className="min-h-screen bg-zinc-50">
			<Header />
			<ProseLayout
				title="Use Cases"
				description="Common ways to use Lumen for traffic analytics."
			>
				<H2>Request Analytics</H2>
				<P>
					Track and analyze traffic patterns across your application:
				</P>
				<UL>
					<LI>Monitor request volume by route</LI>
					<LI>Identify most-accessed endpoints</LI>
					<LI>Track traffic trends over time</LI>
					<LI>Understand user agent distribution</LI>
				</UL>

				<H2>Bot Traffic Analysis</H2>
				<P>
					Identify and analyze bot traffic by examining user-agent strings:
				</P>
				<UL>
					<LI>Detect crawlers by user-agent patterns</LI>
					<LI>Track bot request frequency</LI>
					<LI>Monitor which routes bots access most</LI>
					<LI>Inform robots.txt policy decisions</LI>
				</UL>

				<H2>API Monitoring</H2>
				<P>
					Track usage patterns on your API endpoints:
				</P>
				<UL>
					<LI>Monitor endpoint popularity</LI>
					<LI>Track request methods (GET, POST, etc.)</LI>
					<LI>Analyze query parameter usage</LI>
					<LI>Identify unusual traffic patterns</LI>
				</UL>

				<H2>Performance Debugging</H2>
				<P>
					Use custom metrics to track performance:
				</P>
				<UL>
					<LI>Add duration metrics to events</LI>
					<LI>Track response sizes</LI>
					<LI>Correlate slow requests with routes</LI>
					<LI>Identify performance bottlenecks</LI>
				</UL>

				<H2>Abuse Detection</H2>
				<P>
					Monitor for suspicious traffic patterns:
				</P>
				<UL>
					<LI>Track requests by IP address</LI>
					<LI>Identify high-volume requesters</LI>
					<LI>Detect unusual access patterns</LI>
					<LI>Support rate-limiting decisions</LI>
				</UL>

				<H2>Why Self-Hosted?</H2>
				<H3>Data Ownership</H3>
				<P>
					Your traffic data stays on your infrastructure. No third-party
					services have access to your visitor patterns.
				</P>

				<H3>Privacy Compliance</H3>
				<P>
					Self-hosting simplifies GDPR, CCPA, and other privacy compliance.
					You control data retention and access.
				</P>

				<H3>No Vendor Lock-in</H3>
				<P>
					Store data in your preferred database. Export and integrate with
					existing tools without restrictions.
				</P>

				<H3>Custom Analysis</H3>
				<P>
					Build custom dashboards and alerts. Query your data however you need.
				</P>
			</ProseLayout>
			<Footer />
		</div>
	);
}

import {
	Code,
	CodeBlock,
	Footer,
	H2,
	H3,
	Header,
	LI,
	P,
	ProseLayout,
	TD,
	TH,
	THead,
	Table,
	UL,
} from "../../components";

export default function SDKPage() {
	return (
		<div className="min-h-screen bg-zinc-50">
			<Header />
			<ProseLayout
				title="SDK Reference"
				description="Everything you need to integrate Lumen into your Next.js application."
			>
				<H2>Installation</H2>
				<P>Install the SDK using your preferred package manager:</P>
				<CodeBlock filename="Terminal">{`pnpm add @lumen/lumen-nextjs`}</CodeBlock>

				<H2>Quick Start</H2>
				<P>
					Add Lumen to your Next.js application in under 5 minutes. The
					SDK integrates with <Code>proxy.ts</Code> (Next.js 16+) or{" "}
					<Code>middleware.ts</Code> (Next.js 15+).
				</P>

				<H3>1. Create your proxy file</H3>
				<CodeBlock filename="proxy.ts">{`import { createLumen } from '@lumen/lumen-nextjs';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

const tracker = createLumen({
  ingestUrl: process.env.LUMEN_INGEST_URL!,
  keyId: process.env.LUMEN_KEY_ID!,
  hmacSecret: process.env.LUMEN_HMAC_SECRET!,
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  tracker.capture(req, event);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};`}</CodeBlock>

				<H3>2. Configure environment variables</H3>
				<CodeBlock filename=".env.local">{`LUMEN_INGEST_URL=https://your-backend.com/v1/events
LUMEN_KEY_ID=prod-key-1
LUMEN_HMAC_SECRET=your-secret`}</CodeBlock>

				<H3>3. Deploy and start tracking</H3>
				<P>
					That&apos;s it. Request data will be captured and sent to your backend
					without blocking responses.
				</P>

				<H2>Configuration Options</H2>
				<Table>
					<THead>
						<tr>
							<TH>Option</TH>
							<TH>Type</TH>
							<TH>Required</TH>
							<TH>Description</TH>
						</tr>
					</THead>
					<tbody>
						<tr>
							<TD>
								<Code>ingestUrl</Code>
							</TD>
							<TD>string</TD>
							<TD>Yes</TD>
							<TD>Backend ingest endpoint URL</TD>
						</tr>
						<tr>
							<TD>
								<Code>keyId</Code>
							</TD>
							<TD>string</TD>
							<TD>Yes</TD>
							<TD>Key identifier for HMAC signing</TD>
						</tr>
						<tr>
							<TD>
								<Code>hmacSecret</Code>
							</TD>
							<TD>string</TD>
							<TD>Yes</TD>
							<TD>HMAC secret for payload signing</TD>
						</tr>
						<tr>
							<TD>
								<Code>sampleRate</Code>
							</TD>
							<TD>number</TD>
							<TD>No</TD>
							<TD>Sample rate 0-1 (default: 0.1)</TD>
						</tr>
						<tr>
							<TD>
								<Code>timeout</Code>
							</TD>
							<TD>number</TD>
							<TD>No</TD>
							<TD>Request timeout in ms (default: 3000)</TD>
						</tr>
						<tr>
							<TD>
								<Code>debug</Code>
							</TD>
							<TD>boolean</TD>
							<TD>No</TD>
							<TD>Enable debug logging</TD>
						</tr>
						<tr>
							<TD>
								<Code>excludePaths</Code>
							</TD>
							<TD>string[]</TD>
							<TD>No</TD>
							<TD>Additional paths to exclude</TD>
						</tr>
					</tbody>
				</Table>

				<H2>How It Works</H2>
				<P>
					Lumen uses a fire-and-forget architecture that never impacts
					your application performance:
				</P>
				<UL>
					<LI>Request enters your Next.js application</LI>
					<LI>SDK extracts request metadata (method, path, IP, user-agent)</LI>
					<LI>
						Event is queued using <Code>event.waitUntil()</Code>
					</LI>
					<LI>Response is sent immediately to the user</LI>
					<LI>Event is signed and sent to your backend in the background</LI>
				</UL>

				<H2>Data Captured</H2>
				<P>For each request, the SDK captures:</P>
				<UL>
					<LI>HTTP method and pathname</LI>
					<LI>Query string</LI>
					<LI>User-Agent header</LI>
					<LI>Client IP address</LI>
					<LI>Referer header</LI>
					<LI>Timestamp (ISO 8601)</LI>
					<LI>Custom tags and metrics (optional)</LI>
				</UL>

				<H2>Next.js Compatibility</H2>
				<UL>
					<LI>
						<strong>Next.js 16+</strong> — Full support via proxy.ts
					</LI>
					<LI>
						<strong>Next.js 15+</strong> — Full support via middleware.ts
					</LI>
				</UL>
			</ProseLayout>
			<Footer />
		</div>
	);
}

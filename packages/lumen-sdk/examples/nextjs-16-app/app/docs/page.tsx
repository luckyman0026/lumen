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

export default function DocsPage() {
	return (
		<div className="min-h-screen bg-zinc-50">
			<Header />
			<ProseLayout
				title="Documentation"
				description="Learn how to integrate Lumen and build your analytics backend."
			>
				<H2>Architecture Overview</H2>
				<P>Lumen consists of two parts:</P>
				<UL>
					<LI>
						<strong>SDK</strong> — npm package installed in your Next.js app
					</LI>
					<LI>
						<strong>Backend</strong> — Your service that receives and stores
						events
					</LI>
				</UL>

				<H2>Event Flow</H2>
				<P>When a request hits your Next.js app:</P>
				<UL>
					<LI>SDK extracts request metadata (method, path, IP, user-agent)</LI>
					<LI>Event is signed with HMAC-SHA256</LI>
					<LI>
						Event is queued via <Code>event.waitUntil()</Code>
					</LI>
					<LI>Response is sent immediately (no blocking)</LI>
					<LI>Event is POSTed to your backend in the background</LI>
				</UL>

				<H2>Backend Requirements</H2>
				<P>Your backend needs to:</P>
				<UL>
					<LI>
						Accept POST requests to <Code>/v1/events</Code>
					</LI>
					<LI>Verify the HMAC signature</LI>
					<LI>
						Return <Code>202 Accepted</Code> quickly
					</LI>
					<LI>Store events asynchronously</LI>
				</UL>

				<H3>Request Format</H3>
				<P>Events are sent as JSON with these headers:</P>
				<Table>
					<THead>
						<tr>
							<TH>Header</TH>
							<TH>Description</TH>
						</tr>
					</THead>
					<tbody>
						<tr>
							<TD>
								<Code>x-lumen-key-id</Code>
							</TD>
							<TD>Key identifier</TD>
						</tr>
						<tr>
							<TD>
								<Code>x-lumen-ts</Code>
							</TD>
							<TD>Unix timestamp (ms)</TD>
						</tr>
						<tr>
							<TD>
								<Code>x-lumen-signature</Code>
							</TD>
							<TD>HMAC-SHA256 signature (base64url)</TD>
						</tr>
					</tbody>
				</Table>

				<H3>Signature Verification</H3>
				<CodeBlock filename="verify.ts">{`import { createHmac } from 'crypto';

function verify(body: string, timestamp: string, signature: string, secret: string) {
  const expected = createHmac('sha256', secret)
    .update(\`\${timestamp}.\${body}\`)
    .digest('base64url');
  return signature === expected;
}`}</CodeBlock>

				<H3>Event Schema</H3>
				<CodeBlock filename="event.json">{`{
  "events": [{
    "version": "1",
    "eventType": "request",
    "requestId": "uuid-v4",
    "timestamp": "2024-12-24T12:00:00.000Z",
    "nonce": "random-base64url",
    "keyId": "prod-key-1",
    "method": "GET",
    "pathname": "/api/users",
    "search": "?page=1",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "referer": "https://example.com"
  }]
}`}</CodeBlock>

				<H2>Security</H2>
				<H3>Secret Generation</H3>
				<CodeBlock filename="Terminal">{"openssl rand -base64 32"}</CodeBlock>

				<H3>Best Practices</H3>
				<UL>
					<LI>Use HTTPS for all connections</LI>
					<LI>Validate timestamp to prevent replay attacks (±5 min)</LI>
					<LI>Rotate secrets periodically using multiple key IDs</LI>
					<LI>Store secrets in environment variables, never in code</LI>
				</UL>

				<H2>Sampling</H2>
				<P>
					Sampling is deterministic based on request ID hash. Same request ID
					always produces the same sampling decision.
				</P>
				<CodeBlock filename="config">{`sampleRate: 1.0   // 100% - capture everything
sampleRate: 0.1   // 10% - capture 1 in 10
sampleRate: 0.01  // 1% - capture 1 in 100`}</CodeBlock>
			</ProseLayout>
			<Footer />
		</div>
	);
}

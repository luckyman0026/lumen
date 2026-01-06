export function HeroSection() {
	return (
		<section className="pt-20 pb-16 px-4 sm:px-6">
			<div className="max-w-4xl mx-auto text-center">
				<h1 className="text-4xl sm:text-5xl font-semibold text-black tracking-tight leading-snug">
					Fire-and-forget
					<br />
					<span>traffic analytics</span>
				</h1>

				<p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
					Lumen captures request-level traffic data in your Next.js app
					without blocking user requests. Self-hosted analytics you control.
				</p>

				<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
					<div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 font-mono text-sm text-zinc-700 border border-zinc-200">
						<span className="text-zinc-400">$</span>
						<code>pnpm add @lumen/nextjs</code>
						<button
							type="button"
							className="ml-2 text-zinc-400 hover:text-zinc-600 transition-colors"
							aria-label="Copy to clipboard"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Copy</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}

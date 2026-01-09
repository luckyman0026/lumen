export function CodeExampleSection() {
	return (
		<div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
			<div className="bg-zinc-900 overflow-hidden rounded-md">
				<div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
					<div className="flex gap-1.5">
						<div className="w-3 h-3 rounded-full bg-zinc-600" />
						<div className="w-3 h-3 rounded-full bg-zinc-600" />
						<div className="w-3 h-3 rounded-full bg-zinc-600" />
					</div>
					<span className="text-xs text-zinc-400 ml-2">proxy.ts</span>
				</div>

				<div className="p-4 sm:p-6 font-mono text-sm text-zinc-100 overflow-x-auto">
					<div className="space-y-1">
						<div>
							<span className="text-amber-400">import</span>
							<span className="text-zinc-100">
								{" "}
								{"{"} createLumen {"}"}{" "}
							</span>
							<span className="text-amber-400">from</span>
							<span className="text-amber-200">
								{" "}
								&apos;@lumen/lumen-nextjs&apos;
							</span>
						</div>
						<div>&nbsp;</div>
						<div>
							<span className="text-amber-400">const</span>
							<span className="text-zinc-100"> tracker = </span>
							<span className="text-amber-300">createLumen</span>
							<span className="text-zinc-100">({"{"}</span>
						</div>
						<div className="pl-4">
							<span className="text-zinc-100">ingestUrl: </span>
							<span className="text-amber-200">
								process.env.LUMEN_INGEST_URL
							</span>
							<span className="text-zinc-500">,</span>
						</div>
						<div className="pl-4">
							<span className="text-zinc-100">keyId: </span>
							<span className="text-amber-200">
								process.env.LUMEN_KEY_ID
							</span>
							<span className="text-zinc-500">,</span>
						</div>
						<div className="pl-4">
							<span className="text-zinc-100">hmacSecret: </span>
							<span className="text-amber-200">
								process.env.LUMEN_HMAC_SECRET
							</span>
							<span className="text-zinc-500">,</span>
						</div>
						<div>
							<span className="text-zinc-100">{"})"}</span>
						</div>
						<div>&nbsp;</div>
						<div>
							<span className="text-amber-400">export function</span>
							<span className="text-amber-300"> proxy</span>
							<span className="text-zinc-100">(req, event) {"{"}</span>
						</div>
						<div className="pl-4">
							<span className="text-zinc-100">tracker.</span>
							<span className="text-amber-300">capture</span>
							<span className="text-zinc-100">(req, event)</span>
						</div>
						<div className="pl-4">
							<span className="text-amber-400">return</span>
							<span className="text-zinc-100"> NextResponse.</span>
							<span className="text-amber-300">next</span>
							<span className="text-zinc-100">()</span>
						</div>
						<div>
							<span className="text-zinc-100">{"}"}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

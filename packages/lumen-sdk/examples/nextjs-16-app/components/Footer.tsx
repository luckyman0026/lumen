import Link from "next/link";

export function Footer() {
	return (
		<footer className="py-8 px-4 sm:px-6 border-t border-zinc-200 bg-white">
			<div className="max-w-[90rem] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
				<p className="text-sm text-zinc-500">
					&copy; {new Date().getFullYear()} Lumen — Fire-and-forget
					traffic analytics.
				</p>

				<div className="flex items-center gap-6 text-sm text-zinc-500">
					<Link
						href="https://github.com/lumen/lumen-sdk"
						className="hover:text-zinc-950 transition-colors"
					>
						GitHub
					</Link>
					<Link
						href="https://npmjs.com/package/@lumen/nextjs"
						className="hover:text-zinc-950 transition-colors"
					>
						NPM
					</Link>
				</div>
			</div>
		</footer>
	);
}

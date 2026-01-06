import Link from "next/link";

interface ProseLayoutProps {
	title: string;
	description: string;
	children: React.ReactNode;
}

export function ProseLayout({
	title,
	description,
	children,
}: ProseLayoutProps) {
	return (
		<div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
			<Link
				href="/"
				className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<title>Back</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back to home
			</Link>

			<header className="mb-12">
				<h1 className="text-3xl sm:text-4xl font-semibold text-zinc-950 tracking-tight">
					{title}
				</h1>
				<p className="mt-4 text-lg text-zinc-600">{description}</p>
			</header>

			<article className="prose-content">{children}</article>
		</div>
	);
}

export function H2({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="text-xl font-semibold text-zinc-900 mt-12 mb-4">
			{children}
		</h2>
	);
}

export function H3({ children }: { children: React.ReactNode }) {
	return (
		<h3 className="text-lg font-semibold text-zinc-900 mt-8 mb-3">
			{children}
		</h3>
	);
}

export function P({ children }: { children: React.ReactNode }) {
	return <p className="text-zinc-600 leading-relaxed mb-4">{children}</p>;
}

export function Code({ children }: { children: React.ReactNode }) {
	return (
		<code className="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 text-sm font-mono rounded">
			{children}
		</code>
	);
}

export function CodeBlock({
	children,
	filename,
}: { children: string; filename?: string }) {
	return (
		<div className="my-6 bg-zinc-900 rounded-md overflow-hidden">
			{filename && (
				<div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 text-xs text-zinc-400">
					{filename}
				</div>
			)}
			<pre className="p-4 overflow-x-auto">
				<code className="text-sm text-zinc-100 font-mono">{children}</code>
			</pre>
		</div>
	);
}

export function UL({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc list-inside space-y-2 text-zinc-600 mb-4 ml-4">
			{children}
		</ul>
	);
}

export function LI({ children }: { children: React.ReactNode }) {
	return <li>{children}</li>;
}

export function Table({ children }: { children: React.ReactNode }) {
	return (
		<div className="my-6 overflow-x-auto">
			<table className="w-full text-sm">{children}</table>
		</div>
	);
}

export function THead({ children }: { children: React.ReactNode }) {
	return (
		<thead className="border-b border-zinc-200 text-left">{children}</thead>
	);
}

export function TH({ children }: { children: React.ReactNode }) {
	return <th className="py-2 pr-4 font-semibold text-zinc-900">{children}</th>;
}

export function TD({ children }: { children: React.ReactNode }) {
	return <td className="py-2 pr-4 text-zinc-600">{children}</td>;
}

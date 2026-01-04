import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "@/components/providers";
import { SidebarInset, SidebarProvider } from "@/components/ui";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Lumen - Dashboard",
	description: "Lumen - AI Traffic Analytics Dashboard",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset>{children}</SidebarInset>
					</SidebarProvider>
				</Providers>
			</body>
		</html>
	);
}

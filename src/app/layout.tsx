import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { IssueDetailDrawer } from "@/components/issue-detail-drawer";
import { auth } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Civic Fix-It Board",
  description: "Report and track local civic issues in your neighbourhood — potholes, broken lights, waste, and more.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <IssueDetailDrawer sessionUserId={session?.user?.id ?? null} />
        </Providers>
      </body>
    </html>
  );
}
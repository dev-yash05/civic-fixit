import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { getQueryClient } from "@/lib/query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import Link from "next/link";
import { IssueFeed } from "@/components/issue-feed";
import { Navbar } from "@/components/navbar";

async function fetchIssues() {
  const res = await fetch(`${process.env.AUTH_URL}/api/issues`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function FeedPage() {
  const session = await auth();
  const qc = getQueryClient();

  await qc.prefetchQuery({
    queryKey: ["issues"],
    queryFn: fetchIssues,
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Issue <span className="gradient-text">feed</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">All reported issues, sorted by newest first.</p>
        </div>
        <HydrationBoundary state={dehydrate(qc)}>
          <IssueFeed sessionUserId={session?.user?.id ?? null} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
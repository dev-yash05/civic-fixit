import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { getQueryClient } from "@/lib/query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import Link from "next/link";
import { IssueFeed } from "@/components/issue-feed";

async function fetchIssues() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/issues`, {
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            Civic Fix-It Board
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/map" className="text-sm text-gray-500 hover:text-gray-900">
              Map
            </Link>
            {session ? (
              <>
                <Link
                  href="/report"
                  className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Report
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {session.user?.name}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="text-sm bg-black text-white px-4 py-2 rounded-lg"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Issue feed</h1>
          <p className="text-sm text-gray-500 mt-1">
            All reported issues, sorted by newest first.
          </p>
        </div>

        <HydrationBoundary state={dehydrate(qc)}>
          <IssueFeed sessionUserId={session?.user?.id ?? null} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
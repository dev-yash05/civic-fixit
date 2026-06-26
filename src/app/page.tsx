import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { db } from "@/lib/db";
import { issues, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export default async function HomePage() {
  const session = await auth();

  const [totalIssues, resolvedIssues, totalUsers] = await Promise.all([
    db.select({ count: count() }).from(issues),
    db.select({ count: count() }).from(issues).where(eq(issues.status, "resolved")),
    db.select({ count: count() }).from(users),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg text-gray-900">
            Civic Fix-It Board
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {session.user?.name}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/sign-in"
                className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
        <span className="text-xs font-medium tracking-widest uppercase text-gray-400">
          Community-powered civic reporting
        </span>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Report local issues. Track progress. Make change.
        </h1>
        <p className="text-lg text-gray-500 max-w-xl">
          Pin problems on the map, upvote issues your neighbours care about, and
          watch them get resolved.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/map"
            className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            View the map
          </Link>
          {session ? (
            <Link
              href="/report"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Report an issue
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Sign in to report
            </Link>
          )}
        </div>
      </section>

      {/* stats row */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Issues reported", value: totalIssues[0].count },
            { label: "Resolved", value: resolvedIssues[0].count },
            { label: "Active reporters", value: totalUsers[0].count },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-2xl p-8 text-center"
            >
              <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="bg-white border-t border-gray-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-12 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Spot an issue",
                desc: "See a pothole, broken streetlight, or overflowing bin? Open the app and tap the map.",
              },
              {
                step: "02",
                title: "Pin and describe it",
                desc: "Drop a pin on the exact location, add a photo, pick a category, and submit.",
              },
              {
                step: "03",
                title: "Upvote and track",
                desc: "Neighbours upvote issues they care about. Track status from open to resolved.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-xs font-mono font-semibold text-gray-400">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
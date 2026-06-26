import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { issues } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const userIssues = await db
    .select()
    .from(issues)
    .where(eq(issues.userId, session.user.id))
    .orderBy(desc(issues.createdAt));

  const total = userIssues.length;
  const resolved = userIssues.filter((i) => i.status === "resolved").length;
  const open = userIssues.filter((i) => i.status === "open").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            Civic Fix-It Board
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* profile header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex items-center gap-6">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
              {session.user?.name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {session.user?.name}
            </h1>
            <p className="text-sm text-gray-500">{session.user?.email}</p>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total reported", value: total },
            { label: "Open", value: open },
            { label: "Resolved", value: resolved },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center"
            >
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* issues list */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Your reports
          </h2>

          {userIssues.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-gray-500 text-sm">No issues reported yet.</p>
              <Link
                href="/report"
                className="mt-4 inline-block bg-black text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Report your first issue
              </Link>
            </div>
          ) : (
            userIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {issue.title}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {issue.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {issue.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                    issue.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : issue.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {issue.status.replace("_", " ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
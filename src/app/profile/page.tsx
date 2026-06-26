import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { issues } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { ProfileIssueCard } from "@/components/profile-issue-card";
import { Navbar } from "@/components/navbar";

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
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden pt-24">
        <div className="orb orb-emerald w-[300px] h-[300px] -top-32 right-0 animate-blob" />
        <div className="orb orb-purple w-[250px] h-[250px] bottom-20 -left-20 animate-blob" style={{ animationDelay: "4s" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8 relative z-10">
        {/* Profile header */}
        <div className="glass-card gradient-border rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative shrink-0">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-emerald-400/30 ring-offset-4 ring-offset-[var(--bg-card)] shadow-[0_0_30px_rgba(52,211,153,0.3)] object-cover"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-3xl font-bold text-[#0a0a0f] shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                {session.user?.name?.[0] ?? "?"}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-[var(--bg-card)] p-1.5 rounded-full border border-emerald-400/30">
              <div className="bg-emerald-400/20 text-emerald-400 p-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left z-10 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{session.user?.name}</h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 font-medium">{session.user?.email}</p>
            <div className="flex items-center gap-2 mt-4 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">Civic Reporter</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 stagger-children">
          {[
            { label: "Total Reports", value: total, icon: "📋", color: "from-blue-400 to-cyan-400" },
            { label: "Open Issues", value: open, icon: "🔴", color: "from-amber-400 to-orange-400" },
            { label: "Resolved", value: resolved, icon: "✅", color: "from-emerald-400 to-teal-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-5 sm:p-6 text-center hover:bg-white/5 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <span className="text-xl sm:text-2xl mb-3 block opacity-90 group-hover:scale-110 transition-transform">{stat.icon}</span>
                <p className={`text-2xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent drop-shadow-sm`}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-2 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Issues list */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3 mb-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Reports</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--glass-border)] to-transparent" />
          </div>

          {userIssues.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 sm:p-16 text-center flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-2">🗺️</div>
              <p className="text-[var(--text-primary)] font-medium text-lg">No issues reported yet</p>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm">Help make your neighbourhood better by reporting local problems on the map.</p>
              <Link href="/report" className="gradient-btn inline-flex items-center gap-2 text-sm px-6 py-3 rounded-xl mt-2 font-semibold">
                Report your first issue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 stagger-children">
              {userIssues.map((issue) => (
                <ProfileIssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
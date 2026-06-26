import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { db } from "@/lib/db";
import { issues, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Navbar } from "@/components/navbar";

export default async function HomePage() {
  const session = await auth();

  const [totalIssues, resolvedIssues, totalUsers] = await Promise.all([
    db.select({ count: count() }).from(issues),
    db.select({ count: count() }).from(issues).where(eq(issues.status, "resolved")),
    db.select({ count: count() }).from(users),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden pt-24">
      {/* ── Decorative Orbs ────────────────────────────────────── */}
      <div className="orb orb-emerald w-[400px] h-[400px] -top-48 -left-32 animate-blob" />
      <div className="orb orb-cyan w-[350px] h-[350px] top-1/3 -right-40 animate-blob" style={{ animationDelay: "2s" }} />
      <div className="orb orb-purple w-[300px] h-[300px] bottom-20 left-1/4 animate-blob" style={{ animationDelay: "4s" }} />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 flex flex-col items-center text-center gap-6">
        <span className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase text-[var(--text-accent)] border border-emerald-400/20 bg-emerald-400/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Community-powered civic reporting
        </span>

        <h1 className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl" style={{ animationDelay: "0.1s" }}>
          Report local issues.{" "}
          <span className="gradient-text">Track progress.</span>{" "}
          Make change.
        </h1>

        <p className="animate-fade-in-up text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed" style={{ animationDelay: "0.2s" }}>
          Pin problems on the map, upvote issues your neighbours care about, and
          watch them get resolved.
        </p>

        <div className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/map"
            className="gradient-btn w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-center"
          >
            🗺️ View the map
          </Link>
          {session ? (
            <Link
              href="/report"
              className="glass-card w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] text-center hover:bg-white/5"
            >
              ✏️ Report an issue
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="glass-card w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] text-center hover:bg-white/5"
            >
              Sign in to report
            </Link>
          )}
        </div>
      </section>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 stagger-children">
          {[
            { label: "Issues reported", value: totalIssues[0].count, icon: "📋" },
            { label: "Resolved", value: resolvedIssues[0].count, icon: "✅" },
            { label: "Active reporters", value: totalUsers[0].count, icon: "👥" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card gradient-border rounded-2xl p-6 sm:p-8 text-center"
            >
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl sm:text-4xl font-bold gradient-text">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="relative border-t border-[var(--glass-border)] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-10 sm:mb-16 max-w-md mx-auto">
            Three simple steps to make your community better
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 stagger-children">
            {[
              {
                step: "01",
                title: "Spot an issue",
                desc: "See a pothole, broken streetlight, or overflowing bin? Open the app and tap report.",
                icon: "👁️",
              },
              {
                step: "02",
                title: "Pin and describe it",
                desc: "Drop a pin on the exact location, add a photo, pick a category, and submit.",
                icon: "📍",
              },
              {
                step: "03",
                title: "Upvote and track",
                desc: "Neighbours upvote issues they care about. Track status from open → resolved.",
                icon: "📈",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--text-accent)] tracking-wider">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--glass-border)] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © 2026 Civic Fix-It Board. Built for the community.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Feed
            </Link>
            <Link href="/map" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Map
            </Link>
            <Link href="/report" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Report
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
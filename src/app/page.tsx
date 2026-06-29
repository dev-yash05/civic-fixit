import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { issues, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import {
  ClipboardList,
  CheckCircle2,
  Users,
  Map,
  PenLine,
  LogIn,
  AlertTriangle,
  Lightbulb,
  MapPin,
  Camera,
  ThumbsUp,
  Activity,
  Eye,
  Megaphone,
  Globe,
  Code2,
  Smartphone,
  Shield,
  Earth,
  HeartHandshake,
  ArrowRight,
  Key,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  const [totalIssues, resolvedIssues, totalUsers] = await Promise.all([
    db.select({ count: count() }).from(issues),
    db.select({ count: count() }).from(issues).where(eq(issues.status, "resolved")),
    db.select({ count: count() }).from(users),
  ]);

  return (
    <div className="overflow-x-hidden">
      <Navbar />

      <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden pt-24">
        {/* ── Decorative Orbs ────────────────────────────────────── */}
        <div className="orb orb-emerald w-[400px] h-[400px] -top-48 -left-32 animate-blob" />
        <div className="orb orb-cyan w-[350px] h-[350px] top-1/3 -right-40 animate-blob" style={{ animationDelay: "2s" }} />
        <div className="orb orb-purple w-[300px] h-[300px] bottom-20 left-1/4 animate-blob" style={{ animationDelay: "4s" }} />

        {/* ── Hero Section ───────────────────────────────────────── */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 flex flex-col items-center text-center gap-6">
          <span className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase text-[var(--text-accent)] border border-emerald-400/20 bg-emerald-400/5">
            <Sparkles className="w-3.5 h-3.5" />
            Community-powered civic reporting
          </span>

          <h1 className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl" style={{ animationDelay: "0.1s" }}>
            Report local issues.{" "}
            <span className="gradient-text">Track progress.</span>{" "}
            Make change.
          </h1>

          <p className="animate-fade-in-up text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed" style={{ animationDelay: "0.2s" }}>
            CivicPulse bridges the gap between citizens and municipal authorities — pin problems on the map, upvote what matters, and watch your community improve.
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/map"
              className="gradient-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-center"
            >
              <Map className="w-4 h-4" />
              View the map
            </Link>
            {session ? (
              <Link
                href="/report"
                className="glass-card w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] text-center hover:bg-white/5"
              >
                <PenLine className="w-4 h-4" />
                Report an issue
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="glass-card w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] text-center hover:bg-white/5"
              >
                <LogIn className="w-4 h-4" />
                Sign in to report
              </Link>
            )}
          </div>
        </section>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 stagger-children">
            {[
              { label: "Issues reported", value: totalIssues[0].count, Icon: ClipboardList },
              { label: "Resolved", value: resolvedIssues[0].count, Icon: CheckCircle2 },
              { label: "Active reporters", value: totalUsers[0].count, Icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card gradient-border rounded-2xl p-6 sm:p-8 text-center"
              >
                <stat.Icon className="w-6 h-6 mx-auto mb-2 text-[var(--text-accent)]" />
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

        {/* ── Purpose / About Section ────────────────────────────── */}
        <section className="relative border-t border-[var(--glass-border)] py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
              Why <span className="gradient-text">CivicPulse</span>?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-10 sm:mb-16 max-w-lg mx-auto leading-relaxed">
              Rapid urbanization has outpaced civic maintenance — broken roads, dark streets, and piling waste go unreported. CivicPulse changes that.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Problem Card */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400/20 to-orange-400/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  The Problem
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Over-burdened helplines, outdated municipal portals, and fragmented social media complaints create a void where civic issues disappear into a bureaucratic vacuum. Citizens lack transparency, tracking, and any mechanism to signal community priority.
                </p>
              </div>

              {/* Solution Card */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  Our Solution
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  A map-centric digital platform where authenticated citizens can pin issues at exact GPS locations, attach photo evidence, and let the community upvote what matters most — creating a democratic priority queue for municipal action.
                </p>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 stagger-children">
              {[
                { Icon: MapPin, title: "Precise Geotagging", desc: "Pin issues on an interactive map at their exact location for spatial awareness." },
                { Icon: Camera, title: "Photo Evidence", desc: "Attach photographs to reports for immediate visual context and credibility." },
                { Icon: ThumbsUp, title: "Democratic Upvoting", desc: "Community members upvote issues to surface what needs fixing the most." },
                { Icon: Activity, title: "Real-time Tracking", desc: "Track every report from Open → In Progress → Resolved with full transparency." },
              ].map((feature) => (
                <div key={feature.title} className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.Icon className="w-5 h-5 text-[var(--text-accent)]" />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────── */}
        <section className="relative border-t border-[var(--glass-border)] py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-10 sm:mb-16 max-w-md mx-auto">
              Five simple steps to make your community better
            </p>

            <div className="relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 stagger-children">
                {[
                  { step: "01", title: "Sign in with Google", desc: "Quick OAuth sign-in eliminates account creation friction — one tap and you're in.", Icon: Key },
                  { step: "02", title: "Spot an issue", desc: "See a pothole, broken streetlight, or overflowing bin? Open the app and tap report.", Icon: Eye },
                  { step: "03", title: "Pin & describe it", desc: "Drop a pin on the exact location, snap a photo, pick a category, and submit in under 60 seconds.", Icon: MapPin },
                  { step: "04", title: "Upvote & prioritize", desc: "Browse the map and feed — upvote issues your neighbours care about to signal community priority.", Icon: ThumbsUp },
                  { step: "05", title: "Track resolution", desc: "Follow every report from Open → In Progress → Resolved on your personal profile dashboard.", Icon: CheckCircle2 },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col gap-3 group relative"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.Icon className="w-5 h-5 text-[var(--text-accent)]" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-[var(--text-accent)] tracking-wider">
                        STEP {item.step}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Contribute Section ──────────────────────────────────── */}
        <section className="relative border-t border-[var(--glass-border)] py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
              How to <span className="gradient-text">contribute</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-10 sm:mb-16 max-w-lg mx-auto leading-relaxed">
              CivicPulse thrives on community participation — whether you&apos;re a citizen, developer, or civic enthusiast, there&apos;s a way for you to help.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
              {[
                {
                  Icon: Megaphone,
                  title: "Report & Upvote",
                  desc: "The simplest way to contribute is to use the platform. Report issues you encounter in your neighbourhood and upvote reports from fellow citizens to help surface what matters most.",
                  cta: session ? { label: "Report an issue", href: "/report" } : { label: "Sign in to start", href: "/sign-in" },
                },
                {
                  Icon: Globe,
                  title: "Spread the Word",
                  desc: "Share CivicPulse with your community, local WhatsApp groups, and neighbourhood associations. The more people report, the stronger the signal to municipal authorities.",
                  cta: { label: "Explore the map", href: "/map" },
                },
                {
                  Icon: Code2,
                  title: "Contribute Code",
                  desc: "CivicPulse is open-source. Fork the repository, pick up an issue, submit a pull request — help us build better civic infrastructure for everyone.",
                  cta: { label: "View on GitHub", href: "https://github.com/dev-yash05/civic-fixit" },
                },
              ].map((card) => (
                <div key={card.title} className="glass-card gradient-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <card.Icon className="w-6 h-6 text-[var(--text-accent)]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                    {card.desc}
                  </p>
                  <Link
                    href={card.cta.href}
                    className="gradient-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold mt-2"
                    {...(card.cta.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {card.cta.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Objectives Section ──────────────────────────────────── */}
        <section className="relative border-t border-[var(--glass-border)] py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
              Our <span className="gradient-text">objectives</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-10 sm:mb-16 max-w-lg mx-auto leading-relaxed">
              Every feature is designed with a clear civic purpose
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-children">
              {[
                { Icon: Smartphone, text: "Provide a low-friction, mobile-first issue reporting interface" },
                { Icon: Map, text: "Visualise all reported issues geographically on an interactive map" },
                { Icon: ThumbsUp, text: "Implement democratic upvoting to surface high-priority issues" },
                { Icon: Shield, text: "Ensure data integrity through server-side authentication on all writes" },
                { Icon: Earth, text: "Foster unprecedented transparency and civic accountability" },
                { Icon: HeartHandshake, text: "Transform reactive maintenance into a proactive, community-led service" },
              ].map((obj) => (
                <div key={obj.text} className="glass-card rounded-2xl p-5 sm:p-6 flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <obj.Icon className="w-5 h-5 text-[var(--text-accent)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-2">
                    {obj.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ──────────────────────────────────────────── */}
        <section className="relative border-t border-[var(--glass-border)] py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="glass-card gradient-border rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="orb orb-emerald w-[200px] h-[200px] -top-24 -right-24 animate-blob opacity-20" />
              <div className="orb orb-cyan w-[150px] h-[150px] -bottom-16 -left-16 animate-blob opacity-20" style={{ animationDelay: "3s" }} />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 relative z-10">
                Ready to improve your <span className="gradient-text">neighbourhood</span>?
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 max-w-md mx-auto relative z-10">
                Join the growing community of civic-minded citizens making their city a better place to live.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
                <Link
                  href="/map"
                  className="gradient-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-center"
                >
                  <Map className="w-4 h-4" />
                  Explore the map
                </Link>
                {session ? (
                  <Link
                    href="/report"
                    className="glass-card w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] text-center hover:bg-white/5"
                  >
                    <PenLine className="w-4 h-4" />
                    Report now
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="glass-card w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)] text-center hover:bg-white/5"
                  >
                    <LogIn className="w-4 h-4" />
                    Get started
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="border-t border-[var(--glass-border)] py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              © 2026 CivicPulse. Built for the community, by the community.
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
              <a
                href="https://github.com/dev-yash05/civic-fixit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
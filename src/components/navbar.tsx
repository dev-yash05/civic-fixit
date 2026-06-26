import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="#0a0a0f"
              />
            </svg>
          </div>
          <span className="font-semibold text-[var(--text-primary)] text-sm sm:text-base hidden xs:inline-block">
            Civic Fix-It
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/feed"
            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/map"
            className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Map
          </Link>

          {session ? (
            <>
              <Link
                href="/report"
                className="gradient-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ml-1 sm:ml-0"
              >
                <span className="hidden sm:inline">+ Report</span>
                <span className="sm:hidden">+</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Profile"
              >
                <div className="w-7 h-7 sm:hidden rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-[#0a0a0f]">
                  {session.user?.name?.[0] ?? "?"}
                </div>
                <span className="hidden sm:block">{session.user?.name}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="gradient-btn text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ml-1 sm:ml-0"
            >
              Sign in
            </Link>
          )}

          <div className="w-px h-6 bg-[var(--glass-border)] mx-1 sm:mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

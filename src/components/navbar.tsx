import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import UserIcon from "@/components/icons/user-icon";
import MapPinIcon from "@/components/icons/map-pin-icon";
import LayoutDashboardIcon from "@/components/icons/layout-dashboard-icon";
import PenIcon from "@/components/icons/pen-icon";

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
          <span className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">
            Civic Pulse
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/feed"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group/nav"
          >
            <LayoutDashboardIcon size={16} strokeWidth={2.5} className="group-hover/nav:text-[var(--text-primary)]" />
            <span className="hidden sm:inline">Feed</span>
          </Link>
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group/nav"
          >
            <MapPinIcon size={16} strokeWidth={2.5} className="group-hover/nav:text-[var(--text-primary)]" />
            <span className="hidden sm:inline">Map</span>
          </Link>

          {session ? (
            <>
              <Link
                href="/report"
                className="gradient-btn flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ml-1 sm:ml-0 group/nav"
              >
                <PenIcon size={14} strokeWidth={2.5} className="group-hover/nav:text-[#0a0a0f]" color="#0a0a0f" />
                <span className="hidden sm:inline">Report</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Profile"
              >
                <div className="w-7 h-7 sm:hidden rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-[#0a0a0f]">
                  {session.user?.name?.[0] ?? "?"}
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <UserIcon size={16} strokeWidth={2.5} />
                  <span>{session.user?.name}</span>
                </div>
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

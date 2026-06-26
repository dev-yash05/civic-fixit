import { signOut } from "@/lib/auth";
import LogoutIcon from "@/components/icons/logout-icon";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <LogoutIcon size={16} strokeWidth={2.5} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
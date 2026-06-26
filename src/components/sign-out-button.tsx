import { signOut } from "@/lib/auth";

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
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
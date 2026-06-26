import { auth } from "@/lib/auth";
import { IssueMap } from "@/components/issue-map";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default async function MapPage() {
  const session = await auth();

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            Civic Fix-It Board
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/report"
                  className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Report issue
                </Link>
                <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
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

      <div className="flex-1 relative">
        <IssueMap />
      </div>
    </div>
  );
}
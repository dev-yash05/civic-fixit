import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportForm } from "@/components/report-form";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ReportPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            Civic Fix-It Board
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/map" className="text-sm text-gray-500 hover:text-gray-900">
              View map
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Report an issue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below. Your report will appear on the map immediately.
          </p>
        </div>
        <ReportForm />
      </div>
    </div>
  );
}
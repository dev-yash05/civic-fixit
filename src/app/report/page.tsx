import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportForm } from "@/components/report-form";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default async function ReportPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden pt-24">
      {/* Decorative orbs */}
      <div className="orb orb-emerald w-[300px] h-[300px] -top-32 right-0 animate-blob" />
      <div className="orb orb-cyan w-[250px] h-[250px] bottom-0 -left-20 animate-blob" style={{ animationDelay: "3s" }} />

      {/* Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            Report an <span className="gradient-text">issue</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Fill in the details below. Your report will appear on the map immediately.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 sm:p-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <ReportForm />
        </div>
      </div>
    </div>
  );
}
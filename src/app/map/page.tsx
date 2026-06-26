import { auth } from "@/lib/auth";
import { IssueMap } from "@/components/issue-map";
import { CurrentLocationButton } from "@/components/current-location-button";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default async function MapPage() {
  const session = await auth();

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] pt-[72px]">
      <Navbar />

      <div className="flex-1 relative">
        <IssueMap sessionUserId={session?.user?.id ?? null} />
        <CurrentLocationButton />
      </div>
    </div>
  );
}
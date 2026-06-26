"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-500">Loading map...</p>
    </div>
  ),
});

export function IssueMap({ sessionUserId }: { sessionUserId: string | null }) {
  return <LeafletMap sessionUserId={sessionUserId} />;
}
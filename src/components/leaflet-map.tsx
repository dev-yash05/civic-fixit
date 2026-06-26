"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui";
import { IssueWithUser } from "@/lib/issues";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryColors: Record<string, string> = {
  road: "#ef4444",
  lighting: "#f59e0b",
  waste: "#10b981",
  water: "#3b82f6",
  park: "#8b5cf6",
  other: "#6b7280",
};

function categoryIcon(category: string) {
  const color = categoryColors[category] ?? "#6b7280";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    className: "",
  });
}

function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

async function fetchIssues(): Promise<IssueWithUser[]> {
  const res = await fetch("/api/issues");
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export default function LeafletMap() {
  const { mapCenter, activeCategory, activeStatus } = useUIStore();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: fetchIssues,
  });

  const filtered = issues.filter((issue) => {
    if (activeCategory !== "all" && issue.category !== activeCategory) return false;
    if (activeStatus !== "all" && issue.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="w-full h-full relative">
      {/* filter bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
        {(["all", "road", "lighting", "waste", "water", "park", "other"] as const).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => useUIStore.getState().setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* issue count badge */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-sm">
        {isLoading ? "Loading..." : `${filtered.length} issue${filtered.length !== 1 ? "s" : ""}`}
      </div>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapCenter.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} zoom={mapCenter.zoom} />

        {filtered.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={categoryIcon(issue.category)}
          >
            <Popup>
              <div className="min-w-[200px] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                    style={{
                      background: categoryColors[issue.category] + "22",
                      color: categoryColors[issue.category],
                    }}
                  >
                    {issue.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      issue.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : issue.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {issue.status.replace("_", " ")}
                  </span>
                </div>

                <p className="font-semibold text-gray-900 text-sm leading-snug">
                  {issue.title}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {issue.description}
                </p>

                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-28 object-cover rounded-lg"
                  />
                )}

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    ▲ {issue.upvoteCount} upvotes
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                {issue.userName && (
                  <p className="text-xs text-gray-400">by {issue.userName}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui";
import { useTheme } from "next-themes";
import { toggleUpvote } from "@/actions/upvote";
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
  road: "#f87171",
  lighting: "#fbbf24",
  waste: "#34d399",
  water: "#60a5fa",
  park: "#a78bfa",
  other: "#9ca3af",
};

const categoryClasses: Record<string, string> = {
  road: "cat-road",
  lighting: "cat-lighting",
  waste: "cat-waste",
  water: "cat-water",
  park: "cat-park",
  other: "cat-other",
};

function categoryIcon(category: string) {
  const color = categoryColors[category] ?? "#9ca3af";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.5"/>
      </filter>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z"
        fill="${color}" stroke="#0a0a0f" stroke-width="2" filter="url(#shadow)"/>
      <circle cx="14" cy="14" r="5" fill="#0a0a0f"/>
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

async function fetchMyUpvotes(): Promise<string[]> {
  const res = await fetch("/api/my-upvotes");
  if (!res.ok) return [];
  return res.json();
}

export default function LeafletMap({ sessionUserId }: { sessionUserId: string | null }) {
  const qc = useQueryClient();
  const { mapCenter, activeCategory, activeStatus } = useUIStore();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: fetchIssues,
  });

  const { data: myUpvotes = [] } = useQuery({
    queryKey: ["my-upvotes"],
    queryFn: fetchMyUpvotes,
    enabled: !!sessionUserId,
  });

  const upvoteMutation = useMutation({
    mutationFn: (issueId: string) => toggleUpvote(issueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      qc.invalidateQueries({ queryKey: ["my-upvotes"] });
    },
  });

  const filtered = issues.filter((issue) => {
    if (activeCategory !== "all" && issue.category !== activeCategory) return false;
    if (activeStatus !== "all" && issue.status !== activeStatus) return false;
    return true;
  });

  // Optional: add dark mode map tiles, e.g. CartoDB Dark Matter
  // url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative">
      {/* filter bar - Mobile scrollable */}
      <div className="absolute top-4 left-0 right-0 z-[1000] px-3 sm:px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 glass px-2 py-2 rounded-xl w-fit mx-auto whitespace-nowrap">
          {(["all", "road", "lighting", "waste", "water", "park", "other"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => useUIStore.getState().setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#0a0a0f] shadow-lg shadow-emerald-500/20"
                    : "text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* issue count badge */}
      <div className="absolute bottom-6 left-4 z-[1000] glass px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-primary)] shadow-lg">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⟳</span> Loading...
          </span>
        ) : (
          `${filtered.length} issue${filtered.length !== 1 ? "s" : ""}`
        )}
      </div>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapCenter.zoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={resolvedTheme === "light" 
            ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          subdomains="abcd"
          maxZoom={20}
        />
        <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} zoom={mapCenter.zoom} />

        {filtered.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={categoryIcon(issue.category)}
          >
            <Popup className="dark-popup" maxWidth={340} minWidth={220}>
              <div className="w-[75vw] max-w-[260px] sm:max-w-[320px] flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${categoryClasses[issue.category] ?? 'cat-other'}`}>
                    {issue.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium status-${issue.status}`}>
                    {issue.status.replace("_", " ")}
                  </span>
                </div>

                <p className="font-semibold text-[var(--text-primary)] text-sm sm:text-base leading-snug mt-1">
                  {issue.title}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2">
                  {issue.description}
                </p>

                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg mt-1 opacity-90"
                  />
                )}

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--glass-border)]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!sessionUserId) return;
                      upvoteMutation.mutate(issue.id);
                    }}
                    disabled={!sessionUserId || upvoteMutation.isPending}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      myUpvotes.includes(issue.id)
                        ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                        : "border-[var(--glass-border)] text-[var(--text-muted)] hover:border-[var(--glass-border-hover)] hover:text-[var(--text-primary)]"
                    }`}
                    title={sessionUserId ? (myUpvotes.includes(issue.id) ? "Remove upvote" : "Upvote") : "Sign in to upvote"}
                  >
                    <span className="text-xs">▲</span>
                    <span className="text-xs font-semibold">{issue.upvoteCount} upvotes</span>
                  </button>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          background: rgba(20, 20, 25, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          color: var(--text-primary);
        }
        .leaflet-popup-tip {
          background: rgba(20, 20, 25, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: var(--text-secondary);
          padding: 8px;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: var(--text-primary);
        }
        .leaflet-popup-content {
          margin: 12px;
          width: auto !important;
        }
        /* Hide scrollbar for category pills on mobile */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
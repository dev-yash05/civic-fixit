"use client";

import { useUIStore } from "@/store/ui";
import { useState } from "react";

export function CurrentLocationButton() {
  const setMapCenter = useUIStore((state) => state.setMapCenter);
  const [loading, setLoading] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 16,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check your permissions.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <button
      onClick={handleLocate}
      disabled={loading}
      className="absolute bottom-6 right-4 z-[1000] w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full shadow-[0_8px_16px_-6px_rgba(52,211,153,0.5)] hover:scale-110 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center text-[#0a0a0f]"
      aria-label="Locate me"
      title="Go to current location"
    >
      {loading ? (
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4 12H2M22 12h-2M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )}
    </button>
  );
}

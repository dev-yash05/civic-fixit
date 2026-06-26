"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom red pin icon for the location picker
const pickerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.5"/>
    </filter>
    <path d="M16 0C7.16 0 0 7.16 0 16c0 10.67 16 26 16 26s16-15.33 16-26C32 7.16 24.84 0 16 0z"
      fill="#34d399" stroke="#0a0a0f" stroke-width="2" filter="url(#shadow)"/>
    <circle cx="16" cy="16" r="6" fill="#0a0a0f"/>
    <circle cx="16" cy="16" r="3" fill="#34d399"/>
  </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  className: "",
});

// Default center (India)
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const LOCATED_ZOOM = 16;

interface LocationPickerMapProps {
  initialCoords?: { lat: number; lng: number } | null;
  onLocationSelect: (coords: { lat: number; lng: number }, address: string) => void;
}

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      }
    },
  };

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      icon={pickerIcon}
      ref={markerRef}
    />
  );
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

export default function LocationPickerMap({ initialCoords, onLocationSelect }: LocationPickerMapProps) {
  const { resolvedTheme } = useTheme();
  const [markerPos, setMarkerPos] = useState<[number, number]>(
    initialCoords ? [initialCoords.lat, initialCoords.lng] : DEFAULT_CENTER
  );
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(
    initialCoords ? { lat: initialCoords.lat, lng: initialCoords.lng, zoom: LOCATED_ZOOM } : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        onLocationSelect({ lat, lng }, data.display_name ?? "");
      } catch {
        onLocationSelect({ lat, lng }, "");
      } finally {
        setGeocoding(false);
      }
    },
    [onLocationSelect]
  );

  function handleMarkerMove(lat: number, lng: number) {
    setMarkerPos([lat, lng]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 500);
  }

  function handleMapClick(lat: number, lng: number) {
    setMarkerPos([lat, lng]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => reverseGeocode(lat, lng), 500);
  }

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPos([latitude, longitude]);
        setFlyTarget({ lat: latitude, lng: longitude, zoom: LOCATED_ZOOM });
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[var(--glass-border)]" style={{ height: "320px", zIndex: 1 }}>
      {/* Locate Me button overlay */}
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute top-3 right-3 z-[1000] glass px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-white/10 disabled:opacity-50 shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        {isLocating ? (
          <>
            <span className="animate-spin text-sm">⟳</span> Locating...
          </>
        ) : (
          <>📍 My location</>
        )}
      </button>

      {/* Geocoding indicator */}
      {geocoding && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] glass px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] shadow-lg animate-fade-in-up">
          Getting address...
        </div>
      )}

      {/* Instruction overlay */}
      <div className="absolute top-3 left-3 z-[1000] glass px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] shadow-lg pointer-events-none">
        Click or drag pin
      </div>

      <MapContainer
        center={markerPos}
        zoom={initialCoords ? LOCATED_ZOOM : DEFAULT_ZOOM}
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
        <MapClickHandler onClick={handleMapClick} />
        <DraggableMarker position={markerPos} onDragEnd={handleMarkerMove} />
        {flyTarget && <FlyToLocation lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}
      </MapContainer>
    </div>
  );
}

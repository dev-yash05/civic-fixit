"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { createIssue } from "@/actions/create-issue";
import { useRouter } from "next/navigation";
import { LocationPickerMap } from "@/components/location-picker";

const CATEGORIES = ["road", "lighting", "waste", "water", "park", "other"] as const;

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  road: { label: "Road / Pothole", icon: "🚧" },
  lighting: { label: "Street lighting", icon: "💡" },
  waste: { label: "Waste / Bins", icon: "🗑️" },
  water: { label: "Water / Drainage", icon: "💧" },
  park: { label: "Park / Green", icon: "🌳" },
  other: { label: "Other", icon: "📌" },
};

export function ReportForm() {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"auto" | "map" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function detectLocation() {
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationMethod("auto");
        setShowMapPicker(false);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setAddress(data.display_name ?? "");
        } catch { setAddress(""); }
        setLocating(false);
      },
      () => {
        setLocationError("Could not get your location. Pick on the map below.");
        setLocating(false);
        setShowMapPicker(true);
      },
      { enableHighAccuracy: true }
    );
  }

  const handleMapLocationSelect = useCallback(
    (newCoords: { lat: number; lng: number }, newAddress: string) => {
      setCoords(newCoords);
      setAddress(newAddress);
      setLocationMethod("map");
      setLocationError(null);
    },
    []
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!coords) {
      setError("Please set your location before submitting.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("lat", coords.lat.toString());
    formData.set("lng", coords.lng.toString());
    formData.set("address", address);
    startTransition(async () => {
      try {
        await createIssue(formData);
      } catch (err: any) {
        if (err?.message?.includes("NEXT_REDIRECT")) return;
        setError(err?.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. Large pothole on MG Road near bus stop"
          className="glass-input w-full px-4 py-3 text-sm"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="Describe the issue in detail — size, severity, how long it's been there..."
          className="glass-input w-full px-4 py-3 text-sm resize-none"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Category <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="relative flex items-center gap-2 glass-input rounded-xl px-3 py-3 cursor-pointer hover:bg-white/5 has-[:checked]:border-emerald-400/50 has-[:checked]:bg-emerald-400/10 has-[:checked]:shadow-[0_0_15px_rgba(52,211,153,0.1)] transition-all"
            >
              <input type="radio" name="category" value={cat} required className="sr-only" />
              <span className="text-sm font-medium w-full text-center text-[var(--text-primary)]">
                {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Location <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className={`flex items-center justify-center gap-2 glass-input rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
              locationMethod === "auto"
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                : "text-[var(--text-primary)] hover:bg-white/5"
            } disabled:opacity-50`}
          >
            {locating ? (
              <><span className="animate-spin text-base">⟳</span> Detecting...</>
            ) : locationMethod === "auto" ? (
              <>✓ GPS</>
            ) : (
              <>📍 Use GPS</>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowMapPicker(!showMapPicker);
              if (!showMapPicker && !coords) setLocationMethod("map");
            }}
            className={`flex items-center justify-center gap-2 glass-input rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
              showMapPicker || locationMethod === "map"
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                : "text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            {locationMethod === "map" && coords ? <>✓ Map</> : <>🗺️ Pick on map</>}
          </button>
        </div>

        {locationError && <p className="text-xs text-red-400">{locationError}</p>}

        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: showMapPicker ? "400px" : "0px", opacity: showMapPicker ? 1 : 0 }}
        >
          <div className="pt-1">
            <LocationPickerMap initialCoords={coords} onLocationSelect={handleMapLocationSelect} />
          </div>
        </div>

        {coords && (
          <div className="glass-input rounded-xl px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)] font-mono">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
              <span className="text-xs text-[var(--text-accent)]">{locationMethod === "auto" ? "via GPS" : "via map"}</span>
            </div>
            {address && <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{address}</p>}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          Photo <span className="text-[var(--text-muted)] font-normal">(optional)</span>
        </label>
        <div
          className="glass-input rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors border-dashed"
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <p className="text-sm text-[var(--text-secondary)]">Click to upload a photo</p>
              <p className="text-xs text-[var(--text-muted)]">JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} name="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !coords}
        className="gradient-btn w-full py-3.5 rounded-xl text-sm font-semibold"
      >
        {isPending ? "Submitting..." : "Submit report"}
      </button>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Your report will be visible on the map immediately after submission.
      </p>
    </form>
  );
}
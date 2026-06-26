"use client";

import { useState, useRef, useTransition } from "react";
import { createIssue } from "@/actions/create-issue";
import { useRouter } from "next/navigation";

const CATEGORIES = ["road", "lighting", "waste", "water", "park", "other"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  road: "🚧 Road / Pothole",
  lighting: "💡 Street lighting",
  waste: "🗑️ Waste / Bins",
  water: "💧 Water / Drainage",
  park: "🌳 Park / Green space",
  other: "📌 Other",
};

export function ReportForm() {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
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

        // reverse geocode using OpenStreetMap Nominatim (free)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name ?? "");
        } catch {
          setAddress("");
        }

        setLocating(false);
      },
      (err) => {
        setLocationError("Could not get your location. Please allow location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!coords) {
      setError("Please detect your location before submitting.");
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
        // redirect() throws internally — ignore NEXT_REDIRECT
        if (err?.message?.includes("NEXT_REDIRECT")) return;
        setError(err?.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. Large pothole on MG Road near bus stop"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      {/* description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          required
          rows={4}
          placeholder="Describe the issue in detail — size, severity, how long it's been there..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
        />
      </div>

      {/* category */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="relative flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white transition-colors"
            >
              <input
                type="radio"
                name="category"
                value={cat}
                required
                className="sr-only"
              />
              <span className="text-sm font-medium capitalize w-full text-center">
                {CATEGORY_LABELS[cat]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* location */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Location <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {locating ? (
            <>
              <span className="animate-spin text-base">⟳</span>
              Detecting location...
            </>
          ) : coords ? (
            <>
              ✓ Location detected
            </>
          ) : (
            <>
              📍 Use my current location
            </>
          )}
        </button>

        {locationError && (
          <p className="text-xs text-red-500">{locationError}</p>
        )}

        {coords && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-1">
            <p className="text-xs text-gray-500 font-mono">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
            {address && (
              <p className="text-xs text-gray-600 line-clamp-2">{address}</p>
            )}
          </div>
        )}
      </div>

      {/* image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Photo <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-lg"
            />
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <p className="text-sm text-gray-500">Click to upload a photo</p>
              <p className="text-xs text-gray-400">JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          name="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* submit */}
      <button
        type="submit"
        disabled={isPending || !coords}
        className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Submitting..." : "Submit report"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your report will be visible on the map immediately after submission.
      </p>
    </form>
  );
}
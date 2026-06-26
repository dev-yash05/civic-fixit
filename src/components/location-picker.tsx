"use client";

import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200"
      style={{ height: "320px" }}
    >
      <p className="text-sm text-gray-500">Loading map...</p>
    </div>
  ),
});

export { LocationPickerMap };

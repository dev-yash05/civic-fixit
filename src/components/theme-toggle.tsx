"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import MoonIcon from "@/components/icons/moon-icon";
import BrightnessDownIcon from "@/components/icons/brightness-down-icon";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-lg border border-[var(--glass-border)] bg-transparent flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <BrightnessDownIcon size={16} strokeWidth={2.5} />
      ) : (
        <MoonIcon size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}

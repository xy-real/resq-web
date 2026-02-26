"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-theme-bg-tertiary ring-1 ring-theme-border-primary transition-all hover:bg-theme-interactive-hover hover:ring-theme-border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      style={
        {
          "--tw-ring-offset-color": "rgb(var(--bg-primary))",
        } as React.CSSProperties
      }
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        className="absolute h-5 w-5 rotate-0 scale-100 text-theme-text-tertiary transition-all group-hover:text-theme-text-secondary dark:-rotate-90 dark:scale-0"
        strokeWidth={1.8}
      />
      <Moon
        className="absolute h-5 w-5 rotate-90 scale-0 text-theme-text-tertiary transition-all group-hover:text-theme-text-secondary dark:rotate-0 dark:scale-100"
        strokeWidth={1.8}
      />
    </button>
  );
}

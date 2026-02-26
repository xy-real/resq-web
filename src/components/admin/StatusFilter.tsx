"use client";

import { cn } from "@/lib/cn";
import type { DashboardStats, FilterType } from "@/types";
import { STATUS_CONFIG } from "@/lib/utils";

interface StatusFilterProps {
  active: FilterType;
  stats: DashboardStats;
  onChange: (filter: FilterType) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All Students" },
  { key: "SAFE", label: "Safe" },
  { key: "NEEDS_ASSISTANCE", label: "Needs Assistance" },
  { key: "CRITICAL", label: "Critical" },
  { key: "EVACUATED", label: "Evacuated" },
  { key: "UNKNOWN", label: "Unknown" },
];

export default function StatusFilter({
  active,
  stats,
  onChange,
}: StatusFilterProps) {
  const getCount = (key: FilterType) => {
    if (key === "all") return stats.total;
    return stats[key];
  };

  const getColor = (key: FilterType) => {
    if (key === "all")
      return {
        color: "text-slate-300",
        bg: "bg-slate-500/10",
        ring: "ring-slate-500/30",
      };
    return STATUS_CONFIG[key];
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, label }) => {
        const cfg = getColor(key);
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-base font-semibold ring-1 transition-all duration-150 font-inter",
              isActive
                ? cn(cfg.bg, cfg.color, cfg.ring, "ring-opacity-60")
                : "bg-transparent text-theme-text-secondary hover:text-theme-text-primary",
            )}
            style={
              !isActive
                ? ({
                    borderColor: "rgb(var(--border-primary))",
                    "--tw-ring-color": "rgb(var(--border-primary))",
                  } as React.CSSProperties)
                : undefined
            }
          >
            {label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-sm font-bold tabular-nums font-inter",
                isActive ? cn(cfg.bg, cfg.color) : "text-theme-text-secondary",
              )}
              style={
                !isActive
                  ? { backgroundColor: "rgb(var(--bg-tertiary))" }
                  : undefined
              }
            >
              {getCount(key)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

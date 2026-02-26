"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string; // e.g. 'text-emerald-400'
  bgClass: string; // e.g. 'bg-emerald-500/10'
  ringClass?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  ringClass = "ring-white/5",
  onClick,
  isActive,
}: StatsCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full text-left rounded-xl p-5 ring-1 transition-all duration-200",
        "hover:bg-theme-interactive-hover",
        isActive && "ring-2 ring-offset-0",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
      style={{
        backgroundColor: "rgb(var(--bg-secondary))",
        borderColor: "rgb(var(--border-primary))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("rounded-lg p-2.5", bgClass)}>
          <Icon className={cn("h-5 w-5", colorClass)} strokeWidth={1.8} />
        </div>
        {isActive && (
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full",
              bgClass,
              colorClass,
            )}
          >
            Active
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-4 text-4xl font-bold tabular-nums tracking-tight font-inter",
          colorClass,
        )}
      >
        {value.toLocaleString()}
      </p>
      <p className="mt-2 text-base font-semibold text-theme-text-secondary tracking-tight">
        {label}
      </p>
    </button>
  );
}

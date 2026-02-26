"use client";

import { RefreshCw, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  isDisasterMode: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  isRefreshing,
  isDisasterMode,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-xl p-3 ring-1 transition-colors",
            isDisasterMode
              ? "bg-red-500/10 ring-red-500/30"
              : "bg-sky-500/10 ring-sky-500/20",
          )}
        >
          <Shield
            className={cn(
              "h-6 w-6 transition-colors",
              isDisasterMode ? "text-red-400" : "text-sky-400",
            )}
            strokeWidth={1.8}
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-theme-text-primary tracking-tight">
            VSU Typhoon Response Dashboard
          </h1>
          <p className="text-sm text-theme-text-secondary">
            Monitor and manage student safety status
          </p>
        </div>
        {isDisasterMode && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 ring-1 ring-red-500/30 animate-pulse">
            DISASTER MODE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-theme-bg-tertiary hover:bg-theme-interactive-hover disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-theme-text-secondary ring-1 ring-theme-border-primary transition"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 transition-transform",
              isRefreshing && "animate-spin",
            )}
          />
          Refresh
        </button>
      </div>
    </header>
  );
}

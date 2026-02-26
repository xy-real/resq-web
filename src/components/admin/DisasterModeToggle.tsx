"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface DisasterModeToggleProps {
  isActive: boolean;
  isLoading: boolean;
  onToggle: (value: boolean) => void;
}

export default function DisasterModeToggle({
  isActive,
  isLoading,
  onToggle,
}: DisasterModeToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl px-5 py-3.5 ring-1 transition-all duration-300",
        isActive ? "bg-red-500/10 ring-red-500/40" : "ring-1",
      )}
      style={
        !isActive
          ? {
              backgroundColor: "rgb(var(--bg-secondary))",
              borderColor: "rgb(var(--border-primary))",
            }
          : undefined
      }
    >
      <div
        className={cn("rounded-lg p-2", isActive ? "bg-red-500/20" : "")}
        style={
          !isActive ? { backgroundColor: "rgb(var(--bg-tertiary))" } : undefined
        }
      >
        <AlertTriangle
          className={cn(
            "h-5 w-5 transition-colors",
            isActive ? "text-red-400" : "text-slate-400",
          )}
          strokeWidth={1.8}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold transition-colors",
            isActive ? "text-red-500" : "text-theme-text-primary",
          )}
        >
          Disaster Mode
        </p>
        <p className="text-xs text-theme-text-tertiary truncate">
          {isActive ? "Active — typhoon response engaged" : "Normal operations"}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={isLoading}
        onClick={() => onToggle(!isActive)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent",
          "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isActive
            ? "bg-red-500 focus-visible:ring-red-500"
            : "focus-visible:ring-slate-400",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
        style={
          {
            "--tw-ring-offset-color": "rgb(var(--bg-primary))",
            backgroundColor: !isActive ? "rgb(var(--bg-tertiary))" : undefined,
          } as React.CSSProperties
        }
      >
        <span
          className={cn(
            "pointer-events-none inline-flex h-5 w-5 items-center justify-center",
            "transform rounded-full bg-white shadow ring-0 transition-transform duration-200",
            isActive ? "translate-x-5" : "translate-x-0",
          )}
        >
          {isLoading && (
            <Loader2 className="h-3 w-3 text-slate-400 animate-spin" />
          )}
        </span>
      </button>
    </div>
  );
}

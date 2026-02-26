"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";

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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleToggle = () => {
    // Show confirmation only when activating disaster mode
    if (!isActive) {
      setShowConfirmation(true);
    } else {
      onToggle(false);
    }
  };

  const confirmActivation = () => {
    setShowConfirmation(false);
    onToggle(true);
  };

  const cancelActivation = () => {
    setShowConfirmation(false);
  };
  return (
    <>
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
            "text-base font-bold transition-colors font-inter",
            isActive ? "text-red-500" : "text-theme-text-primary",
          )}
        >
          Disaster Mode
        </p>
        <p className="text-sm text-theme-text-tertiary truncate mt-0.5">
          {isActive ? "Active — typhoon response engaged" : "Normal operations"}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={isLoading}
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent",
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

    {/* Confirmation Modal */}
    {showConfirmation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={cancelActivation}
        />
        
        {/* Modal */}
        <div
          className="relative z-10 w-full max-w-md rounded-xl ring-1 shadow-2xl p-6 mx-4"
          style={{
            backgroundColor: "rgb(var(--bg-secondary))",
            borderColor: "rgb(var(--border-primary))",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-500/10 p-2.5 shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-theme-text-primary font-inter">
                Activate Disaster Mode?
              </h3>
              <p className="text-sm text-theme-text-secondary mt-2 leading-relaxed">
                This will enable emergency response protocols and alert all administrators. 
                Only activate during actual disaster situations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={cancelActivation}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border font-inter hover:bg-theme-interactive-hover"
              style={{
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmActivation}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-red-500 hover:bg-red-600 text-white border border-red-500 font-inter"
            >
              Activate
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

"use client";

import { RefreshCw, Shield, LogOut, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  isDisasterMode: boolean;
  onRefresh: () => void;
  onAddEvacuationCenter: () => void;
}

export default function DashboardHeader({
  isRefreshing,
  isDisasterMode,
  onRefresh,
  onAddEvacuationCenter,
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();

      if (error) {
        toast.error("Logout failed", {
          description: error.message,
        });
        return;
      }

      toast.success("Logged out successfully");
      router.push("/signin");
    } catch (err) {
      toast.error("An error occurred", {
        description: "Please try again",
      });
    }
  };

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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-theme-text-primary tracking-tight leading-tight">
            VSU Typhoon Response Dashboard
          </h1>
          <p className="text-base text-theme-text-secondary mt-1">
            Monitor and manage student safety status
          </p>
        </div>
        {isDisasterMode && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-400 ring-1 ring-red-500/30 animate-pulse font-inter">
            DISASTER MODE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={onAddEvacuationCenter}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2.5 text-base font-semibold text-purple-400 ring-1 ring-purple-500/30 transition font-inter"
          title="Add Evacuation Center"
        >
          <MapPin className="h-4 w-4" />
          Add Evacuation Center
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-theme-bg-tertiary hover:bg-theme-interactive-hover disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-base font-semibold text-theme-text-secondary ring-1 ring-theme-border-primary transition font-inter"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4 transition-transform",
              isRefreshing && "animate-spin",
            )}
          />
          Refresh
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 text-base font-semibold text-red-400 ring-1 ring-red-500/30 transition font-inter"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

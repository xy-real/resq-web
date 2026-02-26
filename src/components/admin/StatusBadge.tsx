import { cn } from "@/lib/cn";
import { STATUS_CONFIG } from "@/lib/utils";
import type { StudentStatus } from "@/types";

interface StatusBadgeProps {
  status: StudentStatus | null;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status ?? "UNKNOWN"];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-bold ring-1 font-inter min-w-[180px] text-center relative",
        cfg.bg,
        cfg.color,
        cfg.ring,
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full shrink-0 absolute left-3",
          cfg.color.replace("text-", "bg-"),
        )}
      />
      <span className="w-full">{cfg.label}</span>
    </span>
  );
}

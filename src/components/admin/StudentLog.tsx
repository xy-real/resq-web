"use client";

import { useState, useMemo, useEffect } from "react";
import {
  History,
  CheckCircle,
  XCircle,
  Smartphone,
  MessageSquare,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { StudentStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/utils";
import FilterModal, { type FilterState } from "./FilterModal";

interface StatusLog {
  id: string;
  student_id: string;
  student_name?: string;
  status: StudentStatus;
  timestamp: Date;
  source: "APP" | "SMS";
  validation_flag: boolean;
}

interface StatusLogResponse {
  id: string;
  student_id: string;
  status: StudentStatus;
  timestamp: string;
  source: "APP" | "SMS";
  validation_flag: boolean;
  students?: {
    name: string;
    email: string;
  };
}

export default function StudentLog() {
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    source: "all",
    validation: "all",
    status: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Fetch status logs from API
  useEffect(() => {
    async function fetchStatusLogs() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/status-logs");

        if (!response.ok) {
          throw new Error("Failed to fetch status logs");
        }

        const data: StatusLogResponse[] = await response.json();

        // Transform API response to StatusLog format
        const transformedLogs: StatusLog[] = data.map((log) => ({
          id: log.id,
          student_id: log.student_id,
          student_name: log.students?.name,
          status: log.status,
          timestamp: new Date(log.timestamp),
          source: log.source,
          validation_flag: log.validation_flag,
        }));

        setLogs(transformedLogs);
      } catch (error) {
        console.error("Error fetching status logs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatusLogs();

    // Poll for new logs every 30 seconds
    const interval = setInterval(fetchStatusLogs, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const sourceMatch =
        filters.source === "all" || log.source === filters.source;
      const validationMatch =
        filters.validation === "all" ||
        (filters.validation === "valid" && log.validation_flag) ||
        (filters.validation === "invalid" && !log.validation_flag);
      const statusMatch =
        filters.status === "all" || log.status === filters.status;
      const searchMatch =
        searchQuery === "" ||
        log.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return sourceMatch && validationMatch && statusMatch && searchMatch;
    });
  }, [logs, filters, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-xl ring-1 p-5"
        style={{
          backgroundColor: "rgb(var(--bg-secondary))",
          borderColor: "rgb(var(--border-primary))",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <History className="h-5 w-5 text-purple-400" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-bold text-lg text-theme-text-primary font-inter">
                Student Status Log
              </p>
              <p className="text-sm text-theme-text-secondary mt-0.5">
                Real-time history of all student status updates
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-theme-text-primary font-inter">
              {filteredLogs.length}
            </p>
            <p className="text-sm text-theme-text-tertiary mt-0.5 font-medium">
              Total Entries
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
            <input
              type="text"
              placeholder="Search by Student ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-base transition-all border font-krub"
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>
        </div>

        {/* Filter Button */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border font-inter hover:bg-theme-interactive-hover"
            style={{
              borderColor: "rgb(var(--border-primary))",
              color: "rgb(var(--text-primary))",
            }}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filters.source !== "all" ||
              filters.validation !== "all" ||
              filters.status !== "all") && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold">
                Active
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {isLoading ? (
          <div
            className="rounded-xl ring-1 p-12 text-center"
            style={{
              backgroundColor: "rgb(var(--bg-secondary))",
              borderColor: "rgb(var(--border-primary))",
            }}
          >
            <Loader2 className="h-12 w-12 text-theme-text-tertiary mx-auto mb-3 animate-spin" />
            <p className="text-theme-text-secondary">Loading status logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div
            className="rounded-xl ring-1 p-12 text-center"
            style={{
              backgroundColor: "rgb(var(--bg-secondary))",
              borderColor: "rgb(var(--border-primary))",
            }}
          >
            <History className="h-12 w-12 text-theme-text-tertiary mx-auto mb-3" />
            <p className="text-theme-text-secondary">No log entries found</p>
            <p className="text-xs text-theme-text-tertiary mt-1">
              Adjust filters or wait for new status updates
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl ring-1 overflow-hidden"
            style={{ borderColor: "rgb(var(--border-primary))" }}
          >
            {filteredLogs.map((log, index) => {
              const statusConfig = STATUS_CONFIG[log.status];
              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition",
                    index !== filteredLogs.length - 1 && "border-b",
                  )}
                  style={{
                    backgroundColor: "rgb(var(--bg-secondary))",
                    borderColor: "rgb(var(--border-secondary))",
                  }}
                >
                  {/* Validation Icon */}
                  <div className="shrink-0">
                    {log.validation_flag ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base text-theme-text-primary">
                        {log.student_name || "Unknown Student"}
                      </p>
                      <span className="text-sm text-theme-text-tertiary font-mono">
                        {log.student_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold font-inter",
                          statusConfig.bg,
                          statusConfig.color,
                        )}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="text-sm text-theme-text-tertiary">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Source Badge */}
                  <div className="shrink-0">
                    <div
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg"
                      style={{ backgroundColor: "rgb(var(--bg-tertiary))" }}
                    >
                      {log.source === "APP" ? (
                        <Smartphone className="h-4 w-4 text-theme-text-tertiary" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-theme-text-tertiary" />
                      )}
                      <span className="text-sm font-semibold text-theme-text-secondary font-inter">
                        {log.source}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}

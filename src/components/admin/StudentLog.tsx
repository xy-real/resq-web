"use client";

import { useState, useMemo } from "react";
import {
  History,
  CheckCircle,
  XCircle,
  Smartphone,
  MessageSquare,
  Filter,
  Search,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { StudentStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/utils";

interface StatusLog {
  id: string;
  student_id: string;
  student_name?: string;
  status: StudentStatus;
  timestamp: Date;
  source: "APP" | "SMS";
  validation_flag: boolean;
}

type SourceFilter = "all" | "APP" | "SMS";
type ValidationFilter = "all" | "valid" | "invalid";
type StatusFilterType = "all" | StudentStatus;

// Mock data - replace with actual API call
const MOCK_LOGS: StatusLog[] = [
  {
    id: "1",
    student_id: "VSU-2024-001",
    student_name: "Juan dela Cruz",
    status: "SAFE",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    source: "APP",
    validation_flag: true,
  },
  {
    id: "2",
    student_id: "VSU-2024-002",
    student_name: "Maria Santos",
    status: "NEEDS_ASSISTANCE",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    source: "SMS",
    validation_flag: true,
  },
  {
    id: "3",
    student_id: "VSU-2024-003",
    student_name: "Pedro Reyes",
    status: "CRITICAL",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    source: "APP",
    validation_flag: true,
  },
  {
    id: "4",
    student_id: "VSU-2024-004",
    student_name: "Ana Garcia",
    status: "EVACUATED",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    source: "SMS",
    validation_flag: false,
  },
];

export default function StudentLog() {
  const [logs] = useState<StatusLog[]>(MOCK_LOGS);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [validationFilter, setValidationFilter] =
    useState<ValidationFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const sourceMatch = sourceFilter === "all" || log.source === sourceFilter;
      const validationMatch =
        validationFilter === "all" ||
        (validationFilter === "valid" && log.validation_flag) ||
        (validationFilter === "invalid" && !log.validation_flag);
      const statusMatch = statusFilter === "all" || log.status === statusFilter;
      const searchMatch =
        searchQuery === "" ||
        log.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return sourceMatch && validationMatch && statusMatch && searchMatch;
    });
  }, [logs, sourceFilter, validationFilter, statusFilter, searchQuery]);

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
              <p className="font-semibold text-theme-text-primary">
                Student Status Log
              </p>
              <p className="text-xs text-theme-text-secondary">
                Real-time history of all student status updates
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-theme-text-primary">
              {filteredLogs.length}
            </p>
            <p className="text-xs text-theme-text-tertiary">Total Entries</p>
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
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all border"
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-theme-text-tertiary" />
            <span className="text-xs font-semibold text-theme-text-tertiary uppercase tracking-wider">
              Source:
            </span>
            {(["all", "APP", "SMS"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSourceFilter(filter)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all border",
                  sourceFilter === filter
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                    : "text-theme-text-secondary hover:text-theme-text-primary",
                )}
                style={
                  sourceFilter !== filter
                    ? { borderColor: "rgb(var(--border-primary))" }
                    : undefined
                }
              >
                {filter === "all" ? "All" : filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-theme-text-tertiary uppercase tracking-wider">
              Validation:
            </span>
            {(["all", "valid", "invalid"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setValidationFilter(filter)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all border",
                  validationFilter === filter
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                    : "text-theme-text-secondary hover:text-theme-text-primary",
                )}
                style={
                  validationFilter !== filter
                    ? { borderColor: "rgb(var(--border-primary))" }
                    : undefined
                }
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-theme-text-tertiary uppercase tracking-wider">
              Status:
            </span>
            {(
              [
                "all",
                "SAFE",
                "NEEDS_ASSISTANCE",
                "CRITICAL",
                "EVACUATED",
                "UNKNOWN",
              ] as StatusFilterType[]
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all border",
                  statusFilter === filter
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                    : "text-theme-text-secondary hover:text-theme-text-primary",
                )}
                style={
                  statusFilter !== filter
                    ? { borderColor: "rgb(var(--border-primary))" }
                    : undefined
                }
              >
                {filter === "all" ? "All" : STATUS_CONFIG[filter].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
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
                  <div className="flex-shrink-0">
                    {log.validation_flag ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-theme-text-primary">
                        {log.student_name || "Unknown Student"}
                      </p>
                      <span className="text-xs text-theme-text-tertiary font-mono">
                        {log.student_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
                          statusConfig.bg,
                          statusConfig.color,
                        )}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-theme-text-tertiary">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Source Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "rgb(var(--bg-tertiary))" }}
                    >
                      {log.source === "APP" ? (
                        <Smartphone className="h-3.5 w-3.5 text-theme-text-tertiary" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-theme-text-tertiary" />
                      )}
                      <span className="text-xs font-medium text-theme-text-secondary">
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
    </div>
  );
}

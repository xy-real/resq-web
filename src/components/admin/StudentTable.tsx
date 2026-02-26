"use client";

import { useState } from "react";
import { MoreHorizontal, ChevronUp, ChevronDown, Search } from "lucide-react";
import type { Student, StudentStatus } from "@/types";
import { STATUS_CONFIG, formatTimestamp } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/cn";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  onStatusOverride: (student: Student, newStatus: StudentStatus) => void;
  onViewDetails: (student: Student) => void;
  onRefresh: () => void;
}

type SortKey =
  | "name"
  | "student_id"
  | "current_status"
  | "last_update_timestamp";
type SortDir = "asc" | "desc";

const STATUSES: StudentStatus[] = [
  "SAFE",
  "NEEDS_ASSISTANCE",
  "CRITICAL",
  "EVACUATED",
  "UNKNOWN",
];

export default function StudentTable({
  students,
  isLoading,
  onStatusOverride,
  onViewDetails,
}: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp className="h-3.5 w-3.5" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5" />
      )
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
        <input
          type="text"
          placeholder="Search name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg pl-9 pr-4 py-2.5 text-base text-theme-text-primary placeholder:text-theme-text-tertiary ring-1 focus:outline-none focus:ring-sky-500/50 transition font-krub"
          style={{
            backgroundColor: "rgb(var(--bg-secondary))",
            borderColor: "rgb(var(--border-primary))",
          }}
        />
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl ring-1"
        style={{ borderColor: "rgb(var(--border-primary))" }}
      >
        <table className="w-full text-base">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: "rgb(var(--border-primary))",
                backgroundColor: "rgb(var(--bg-tertiary))",
              }}
            >
              {(
                [
                  { key: "student_id", label: "Student ID" },
                  { key: "name", label: "Name" },
                  { key: "current_status", label: "Status" },
                  { key: "last_update_timestamp", label: "Last Update" },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer px-4 py-3.5 text-left font-bold text-theme-text-secondary hover:text-theme-text-primary transition select-none font-inter"
                >
                  <span className="inline-flex items-center gap-1">
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3.5 text-left font-bold text-theme-text-secondary font-inter">
                Source
              </th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b"
                  style={{ borderColor: "rgb(var(--border-secondary))" }}
                >
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div
                        className="h-4 rounded-md animate-pulse"
                        style={{ backgroundColor: "rgb(var(--bg-tertiary))" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-theme-text-tertiary text-base"
                >
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const cfg = STATUS_CONFIG[student.current_status ?? "UNKNOWN"];
                return (
                  <tr
                    key={student.id}
                    className="border-b transition-colors"
                    style={{
                      borderColor: "rgb(var(--border-secondary))",
                    }}
                  >
                    <td className="px-4 py-3.5 font-mono text-sm text-theme-text-tertiary">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-theme-text-primary">
                      {student.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={student.current_status} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-theme-text-tertiary tabular-nums whitespace-nowrap">
                      {formatTimestamp(student.last_update_timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      {student.last_update_source && (
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-theme-text-secondary"
                          style={{ backgroundColor: "rgb(var(--bg-tertiary))" }}
                        >
                          {student.last_update_source}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() =>
                            setMenuOpenId((id) =>
                              id === student.id ? null : student.id,
                            )
                          }
                          className="rounded-lg p-1.5 text-theme-text-tertiary hover:text-theme-text-primary transition"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {menuOpenId === student.id && (
                          <div
                            className="absolute right-0 z-10 mt-1 w-52 rounded-xl ring-1 shadow-2xl py-1"
                            style={{
                              backgroundColor: "rgb(var(--bg-secondary))",
                              borderColor: "rgb(var(--border-primary))",
                            }}
                          >
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm text-theme-text-primary"
                              onClick={() => {
                                onViewDetails(student);
                                setMenuOpenId(null);
                              }}
                            >
                              View details
                            </button>
                            <div
                              className="my-1 border-t"
                              style={{
                                borderColor: "rgb(var(--border-primary))",
                              }}
                            />
                            <p className="px-4 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-theme-text-tertiary">
                              Override status
                            </p>
                            {STATUSES.map((s) => {
                              const c = STATUS_CONFIG[s];
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  className={cn(
                                    "w-full px-4 py-2 text-left text-sm transition",
                                    c.color,
                                  )}
                                  onClick={() => {
                                    onStatusOverride(student, s);
                                    setMenuOpenId(null);
                                  }}
                                >
                                  {c.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && (
        <p className="text-xs text-theme-text-tertiary">
          Showing {filtered.length} of {students.length} students
        </p>
      )}
    </div>
  );
}

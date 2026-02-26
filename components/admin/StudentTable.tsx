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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-[#0f1623] pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 ring-1 ring-white/5 focus:outline-none focus:ring-sky-500/50 transition"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl ring-1 ring-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-[#0b1018]">
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
                  className="cursor-pointer px-4 py-3 text-left font-semibold text-slate-400 hover:text-slate-200 transition select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-semibold text-slate-400">
                Source
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded-md bg-white/5 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const cfg = STATUS_CONFIG[student.current_status ?? "UNKNOWN"];
                return (
                  <tr
                    key={student.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {student.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={student.current_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 tabular-nums whitespace-nowrap">
                      {formatTimestamp(student.last_update_timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      {student.last_update_source && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-400">
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
                          className="rounded-lg p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/5 transition"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {menuOpenId === student.id && (
                          <div className="absolute right-0 z-10 mt-1 w-52 rounded-xl bg-[#161e2e] ring-1 ring-white/10 shadow-2xl py-1">
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                              onClick={() => {
                                onViewDetails(student);
                                setMenuOpenId(null);
                              }}
                            >
                              View details
                            </button>
                            <div className="my-1 border-t border-white/5" />
                            <p className="px-4 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                              Override status
                            </p>
                            {STATUSES.map((s) => {
                              const c = STATUS_CONFIG[s];
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  className={cn(
                                    "w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition",
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
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {students.length} students
        </p>
      )}
    </div>
  );
}

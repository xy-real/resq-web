"use client";

import { useMemo, useState } from "react";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Home,
  AlertTriangle,
  Map,
  History,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import {
  useStudents,
  useDisasterMode,
  useStatusOverride,
  useEvacuationCenters,
} from "@/hooks/useDashboard";
import { computeStats, filterStudents } from "@/lib/utils";
import type { FilterType, Student, StudentStatus } from "@/types";

import DashboardHeader from "@/components/admin/DashboardHeader";
import DisasterModeToggle from "@/components/admin/DisasterModeToggle";
import StatsCard from "@/components/admin/StatsCard";
import StatusFilter from "@/components/admin/StatusFilter";
import StudentTable from "@/components/admin/StudentTable";
import StudentLog from "@/components/admin/StudentLog";

// Dynamically import map to avoid SSR issues with Leaflet
const StudentMap = dynamic(() => import("@/components/admin/StudentMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center h-130 rounded-xl ring-1"
      style={{
        backgroundColor: "rgb(var(--bg-secondary))",
        borderColor: "rgb(var(--border-primary))",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
        <p className="text-sm text-theme-text-tertiary">Loading map…</p>
      </div>
    </div>
  ),
});

type TabKey = "overview" | "map" | "log";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Student List", icon: Users },
  { key: "map", label: "Map View", icon: Map },
  { key: "log", label: "Status Log", icon: History },
];

export default function AdminDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data: students = [],
    isLoading: studentsLoading,
    isFetching: studentsRefreshing,
    refetch: refetchStudents,
  } = useStudents();

  const { data: evacuationCenters = [] } = useEvacuationCenters();

  const {
    data: isDisasterMode = false,
    isLoading: settingsLoading,
    toggle: toggleDisasterMode,
    isToggling,
  } = useDisasterMode();

  const overrideStatus = useStatusOverride();

  // ── Derived ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => computeStats(students), [students]);
  const filteredStudents = useMemo(
    () => filterStudents(students, activeFilter),
    [students, activeFilter],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsManuallyRefreshing(true);
    const startTime = Date.now();

    await refetchStudents();

    // Ensure spinner shows for at least 500ms
    const elapsed = Date.now() - startTime;
    if (elapsed < 500) {
      await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
    }

    setIsManuallyRefreshing(false);
  };

  const handleStatusOverride = (student: Student, newStatus: StudentStatus) => {
    overrideStatus.mutate({ student, newStatus });
  };

  const handleViewDetails = (student: Student) => {
    toast.info(`Details for ${student.name}`);
  };

  // ── Stats card config ─────────────────────────────────────────────────────
  const statCards = [
    {
      key: "all" as FilterType,
      label: "Total Students",
      value: stats.total,
      icon: Users,
      colorClass: "text-sky-700 dark:text-sky-400",
      bgClass: "bg-sky-100 dark:bg-sky-500/10",
      ringClass: "ring-sky-500/20",
    },
    {
      key: "SAFE" as FilterType,
      label: "Safe",
      value: stats.SAFE,
      icon: ShieldCheck,
      colorClass: "text-emerald-700 dark:text-emerald-400",
      bgClass: "bg-emerald-100 dark:bg-emerald-500/10",
      ringClass: "ring-emerald-500/20",
    },
    {
      key: "NEEDS_ASSISTANCE" as FilterType,
      label: "Needs Assistance",
      value: stats.NEEDS_ASSISTANCE,
      icon: AlertCircle,
      colorClass: "text-amber-700 dark:text-amber-400",
      bgClass: "bg-amber-100 dark:bg-amber-500/10",
      ringClass: "ring-amber-500/20",
    },
    {
      key: "CRITICAL" as FilterType,
      label: "Critical",
      value: stats.CRITICAL,
      icon: AlertTriangle,
      colorClass: "text-red-700 dark:text-red-400",
      bgClass: "bg-red-100 dark:bg-red-500/10",
      ringClass: "ring-red-500/20",
    },
    {
      key: "EVACUATED" as FilterType,
      label: "Evacuated",
      value: stats.EVACUATED,
      icon: Home,
      colorClass: "text-sky-700 dark:text-sky-400",
      bgClass: "bg-sky-100 dark:bg-sky-500/10",
      ringClass: "ring-sky-500/20",
    },
    {
      key: "UNKNOWN" as FilterType,
      label: "Unknown",
      value: stats.UNKNOWN,
      icon: HelpCircle,
      colorClass: "text-amber-700 dark:text-amber-400",
      bgClass: "bg-amber-100 dark:bg-amber-500/10",
      ringClass: "ring-amber-500/20",
    },
  ];

  return (
    <main
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "rgb(var(--bg-primary))" }}
    >
      {isDisasterMode && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-20%,rgba(239,68,68,0.08),transparent)]" />
      )}

      {/* Fixed Header */}
      <div 
        className="relative z-10 shrink-0 mx-auto w-full max-w-screen-2xl px-4 pt-8 pb-6 sm:px-6 lg:px-10 border-b"
        style={{ borderColor: "rgb(var(--border-primary))" }}
      >
        <DashboardHeader
          isRefreshing={isManuallyRefreshing || studentsRefreshing}
          isDisasterMode={isDisasterMode}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 space-y-8">
        <DisasterModeToggle
          isActive={isDisasterMode}
          isLoading={settingsLoading || isToggling}
          onToggle={toggleDisasterMode}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <StatsCard
              key={card.key}
              label={card.label}
              value={card.value}
              icon={card.icon}
              colorClass={card.colorClass}
              bgClass={card.bgClass}
              ringClass={card.ringClass}
            />
          ))}
        </div>

        <div className="space-y-6">
          <nav
            className="flex gap-1 border-b pb-0"
            style={{ borderColor: "rgb(var(--border-primary))" }}
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={
                    `inline-flex items-center gap-2 rounded-t-lg px-5 py-3 text-base font-semibold transition-all font-inter ` +
                    (isActive
                      ? "text-sky-500 border border-transparent"
                      : "text-theme-text-tertiary hover:text-theme-text-secondary border border-transparent hover:bg-theme-interactive-hover")
                  }
                  style={
                    isActive
                      ? {
                          backgroundColor: "rgb(var(--bg-secondary))",
                          borderColor: "rgb(var(--border-primary))",
                          borderBottomColor: "rgb(var(--bg-secondary))",
                        }
                      : undefined
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div
            className="rounded-xl p-5 sm:p-6 ring-1"
            style={{
              backgroundColor: "rgb(var(--bg-secondary))",
              borderColor: "rgb(var(--border-primary))",
            }}
          >
            {activeTab === "overview" && (
              <div className="space-y-5">
                <StatusFilter
                  active={activeFilter}
                  stats={stats}
                  onChange={setActiveFilter}
                />
                <StudentTable
                  students={filteredStudents}
                  isLoading={studentsLoading}
                  onStatusOverride={handleStatusOverride}
                  onViewDetails={handleViewDetails}
                  onRefresh={() => refetchStudents()}
                />
              </div>
            )}

            <div className={activeTab === "map" ? "block" : "hidden"}>
              <StudentMap
                students={students}
                evacuationCenters={evacuationCenters}
                isVisible={activeTab === "map"}
              />
            </div>

            {activeTab === "log" && <StudentLog />}
          </div>
        </div>
      </div>
    </main>
  );
}

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
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import {
  useStudents,
  useDisasterMode,
  useStatusOverride,
} from "@/hooks/useDashboard";
import { computeStats, filterStudents } from "@/lib/utils";
import type { FilterType, Student, StudentStatus } from "@/types";

import DashboardHeader from "@/components/admin/DashboardHeader";
import DisasterModeToggle from "@/components/admin/DisasterModeToggle";
import StatsCard from "@/components/admin/StatsCard";
import StatusFilter from "@/components/admin/StatusFilter";
import StudentTable from "@/components/admin/StudentTable";
import SMSGatewaySimulator from "@/components/admin/SMSGatewaySimulator";

type TabKey = "overview" | "map" | "sms";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Student List", icon: Users },
  { key: "map", label: "Map View", icon: Map },
  { key: "sms", label: "SMS Gateway", icon: MessageSquare },
];

export default function AdminDashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    data: students = [],
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useStudents();

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
      colorClass: "text-slate-300",
      bgClass: "bg-slate-500/10",
      ringClass: "ring-slate-500/20",
    },
    {
      key: "SAFE" as FilterType,
      label: "Safe",
      value: stats.SAFE,
      icon: ShieldCheck,
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
      ringClass: "ring-emerald-500/20",
    },
    {
      key: "NEEDS_ASSISTANCE" as FilterType,
      label: "Needs Assistance",
      value: stats.NEEDS_ASSISTANCE,
      icon: AlertCircle,
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
      ringClass: "ring-amber-500/20",
    },
    {
      key: "CRITICAL" as FilterType,
      label: "Critical",
      value: stats.CRITICAL,
      icon: AlertTriangle,
      colorClass: "text-red-400",
      bgClass: "bg-red-500/10",
      ringClass: "ring-red-500/20",
    },
    {
      key: "EVACUATED" as FilterType,
      label: "Evacuated",
      value: stats.EVACUATED,
      icon: Home,
      colorClass: "text-sky-400",
      bgClass: "bg-sky-500/10",
      ringClass: "ring-sky-500/20",
    },
    {
      key: "UNKNOWN" as FilterType,
      label: "Unknown",
      value: stats.UNKNOWN,
      icon: HelpCircle,
      colorClass: "text-slate-400",
      bgClass: "bg-slate-500/10",
      ringClass: "ring-slate-500/20",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b1018]">
      {/* Ambient glow when disaster mode is active */}
      {isDisasterMode && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-20%,rgba(239,68,68,0.08),transparent)]" />
      )}

      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10 space-y-8">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <DashboardHeader
          isRefreshing={studentsLoading}
          isDisasterMode={isDisasterMode}
          onRefresh={() => refetchStudents()}
        />

        {/* ── Disaster Mode Toggle ─────────────────────────────────── */}
        <DisasterModeToggle
          isActive={isDisasterMode}
          isLoading={settingsLoading || isToggling}
          onToggle={toggleDisasterMode}
        />

        {/* ── Stats Grid ───────────────────────────────────────────── */}
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
              isActive={activeFilter === card.key}
              onClick={() => setActiveFilter(card.key)}
            />
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Tab bar */}
          <nav className="flex gap-1 border-b border-white/5 pb-0">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={
                    `inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ` +
                    (isActive
                      ? "bg-[#0f1623] text-sky-400 border border-b-[#0f1623] border-white/10"
                      : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Tab panels */}
          <div className="rounded-xl bg-[#0f1623] ring-1 ring-white/5 p-5 sm:p-6">
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

            {activeTab === "map" && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                <Map className="h-12 w-12 text-slate-700" strokeWidth={1} />
                <p className="text-sm">
                  Map view requires a StudentMap component with your preferred
                  map library (e.g. Mapbox, Google Maps, Leaflet).
                </p>
                <p className="text-xs text-slate-600">
                  Drop your{" "}
                  <code className="font-mono text-slate-500">StudentMap</code>{" "}
                  component here and pass{" "}
                  <code className="font-mono text-slate-500">students</code> and{" "}
                  <code className="font-mono text-slate-500">
                    evacuationCenters
                  </code>{" "}
                  as props.
                </p>
              </div>
            )}

            {activeTab === "sms" && <SMSGatewaySimulator />}
          </div>
        </div>
      </div>
    </main>
  );
}

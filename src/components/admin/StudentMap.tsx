"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Building2, Layers } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Student, EvacuationCenter } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type MapFilter = "all" | "students" | "centers";

interface Props {
  students: Student[];
  evacuationCenters: EvacuationCenter[];
  isVisible: boolean; // pass `true` when the Map View tab is active
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VSU_CENTER: [number, number] = [10.7202, 124.7458];
const DEFAULT_ZOOM = 14;

const STATUS_COLORS: Record<string, string> = {
  SAFE: "#22c55e",
  NEEDS_ASSISTANCE: "#f59e0b",
  CRITICAL: "#ef4444",
  EVACUATED: "#3b82f6",
  UNKNOWN: "#6b7280",
};

const LEGEND_ITEMS = [
  { label: "Safe", color: "#22c55e" },
  { label: "Needs Assistance", color: "#f59e0b" },
  { label: "Critical", color: "#ef4444" },
  { label: "Evacuated", color: "#3b82f6" },
  { label: "Unknown", color: "#6b7280" },
  { label: "Evacuation Center", color: "#a855f7" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeStudentIcon(L: typeof import("leaflet"), status: string) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.UNKNOWN;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="10" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function makeCenterIcon(L: typeof import("leaflet")) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="13" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="2"/>
      <text x="17" y="22" text-anchor="middle" font-size="13" font-weight="700"
            font-family="system-ui,sans-serif" fill="#a855f7">E</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentMap({
  students,
  evacuationCenters,
  isVisible,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [mapReady, setMapReady] = useState(false);

  const locatedStudents = students.filter((s) => s.latitude && s.longitude);

  // ── 1. Initialize Leaflet once the container is in the DOM ─────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Leaflet must only run client-side — dynamic import avoids SSR errors
    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: VSU_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false, // we use custom buttons
        attributionControl: false,
      });

      // Dark CARTO tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 },
      ).addTo(map);

      // VSU campus radius ring
      L.circle(VSU_CENTER, {
        radius: 600,
        color: "#38bdf8",
        fillColor: "#38bdf8",
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: "6 4",
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. invalidateSize whenever the tab becomes visible ────────────────────
  //    This is THE critical fix — Leaflet needs to recalculate container size
  useEffect(() => {
    if (!mapRef.current || !isVisible) return;

    // Small delay lets the CSS transition/tab paint finish first
    const timer = setTimeout(() => {
      mapRef.current.invalidateSize({ animate: false });
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // ── 3. Re-render markers when students / centers / filter change ───────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    import("leaflet").then((L) => {
      const map = mapRef.current;

      // Remove existing markers (but keep tile layer + campus ring)
      map.eachLayer((layer: import("leaflet").Layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Student markers
      if (filter !== "centers") {
        locatedStudents.forEach((student) => {
          const icon = makeStudentIcon(L, student.current_status ?? "UNKNOWN");
          const marker = L.marker([student.latitude!, student.longitude!], {
            icon,
          });
          marker.bindPopup(
            `
            <div style="background:#1e293b;color:#f1f5f9;padding:10px 12px;border-radius:8px;min-width:160px;border:1px solid #334155;font-family:system-ui,sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${student.name ?? "Unknown"}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${student.student_id ?? ""}</div>
              <div style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${STATUS_COLORS[student.current_status ?? "UNKNOWN"]}22;color:${STATUS_COLORS[student.current_status ?? "UNKNOWN"]}">
                ${(student.current_status ?? "UNKNOWN").replace("_", " ")}
              </div>
              ${student.last_update_timestamp ? `<div style="font-size:10px;color:#64748b;margin-top:6px">${new Date(student.last_update_timestamp).toLocaleString()}</div>` : ""}
            </div>
          `,
            { className: "leaflet-popup-dark" },
          );
          marker.addTo(map);
        });
      }

      // Evacuation center markers
      if (filter !== "students") {
        evacuationCenters.forEach((center) => {
          if (!center.latitude || !center.longitude) return;
          const icon = makeCenterIcon(L);
          const marker = L.marker([center.latitude, center.longitude], {
            icon,
          });
          marker.bindPopup(
            `
            <div style="background:#1e293b;color:#f1f5f9;padding:10px 12px;border-radius:8px;min-width:160px;border:1px solid #334155;font-family:system-ui,sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${center.name ?? "Evacuation Center"}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${center.address ?? ""}</div>
              <div style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:#a855f722;color:#a855f7">
                Capacity: ${center.capacity ?? "N/A"}
              </div>
            </div>
          `,
            { className: "leaflet-popup-dark" },
          );
          marker.addTo(map);
        });
      }
    });
  }, [mapReady, filter, locatedStudents, evacuationCenters]);

  // ── Custom zoom handlers ───────────────────────────────────────────────────
  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const resetView = () => mapRef.current?.setView(VSU_CENTER, DEFAULT_ZOOM);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(
            [
              { key: "all", label: "All", Icon: Layers },
              { key: "students", label: "Students", Icon: Users },
              { key: "centers", label: "Centers", Icon: Building2 },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filter === key
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-zinc-400 border border-white/5 hover:border-white/10 hover:text-zinc-300",
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>
            <span className="text-zinc-300 font-medium">
              {locatedStudents.length}
            </span>
            /{students.length} students located
          </span>
          <span>
            <span className="text-zinc-300 font-medium">
              {evacuationCenters.length}
            </span>{" "}
            centers
          </span>
        </div>
      </div>

      {/* Map wrapper — explicit height is mandatory for Leaflet */}
      <div
        className="relative rounded-xl overflow-hidden border border-white/5"
        style={{ height: "520px" }}
      >
        {/* Leaflet CSS — injected inline to avoid a separate global import */}
        <style>{`
          @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
          .leaflet-container { background: #0f172a; }
          .leaflet-popup-content-wrapper,
          .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; }
          .leaflet-popup-content { margin: 0 !important; }
        `}</style>

        {/* The actual map div — must have explicit width & height */}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Custom zoom controls */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
          {[
            { label: "+", action: zoomIn },
            { label: "−", action: zoomOut },
            { label: "⊙", action: resetView },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-8 h-8 rounded-lg bg-zinc-900/90 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 text-sm font-bold backdrop-blur-sm transition-all flex items-center justify-center"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Legend
          </p>
          {LEGEND_ITEMS.map(({ label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 mb-1.5 last:mb-0"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Empty state overlay */}
        {mapReady && locatedStudents.length === 0 && filter !== "centers" && (
          <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-4 text-center">
              <Users size={28} className="text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">
                No students with GPS coordinates yet
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Evacuation centers are shown in purple
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

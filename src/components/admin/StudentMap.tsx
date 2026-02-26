"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Users, Building2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Student, EvacuationCenter } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type MapFilter = "centers" | "SAFE" | "NEEDS_ASSISTANCE" | "CRITICAL" | "EVACUATED" | "UNKNOWN";

interface Props {
  students: Student[];
  evacuationCenters: EvacuationCenter[];
  isVisible: boolean; // pass `true` when the Map View tab is active
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Map bounds - coordinates for the restricted area
// Corner coordinates:
//   Upper Left:  10.767016202073258, 124.7697366934059
//   Upper Right: 10.769929735553948, 124.80638501109676
//   Bottom Right: 10.71559064281034, 124.81136412996186
//   Bottom Left: 10.712226996495167, 124.78599149944102
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [10.712226996495167, 124.7697366934059], // Southwest (bottom-left)
  [10.769929735553948, 124.81136412996186], // Northeast (top-right)
];

// Center of the bounded area
const VSU_CENTER: [number, number] = [
  (MAP_BOUNDS[0][0] + MAP_BOUNDS[1][0]) / 2,
  (MAP_BOUNDS[0][1] + MAP_BOUNDS[1][1]) / 2,
];

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
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const [filter, setFilter] = useState<MapFilter>("centers");
  const [mapReady, setMapReady] = useState(false);

  const locatedStudents = students.filter(
    (s) => s.last_known_lat && s.last_known_lng,
  );
  const isDark = theme === "dark";

  // ── 1. Initialize Leaflet once the container is in the DOM ─────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if container already has a Leaflet map initialized
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((containerRef.current as any)._leaflet_id) {
      return; // Skip initialization if map already exists
    }

    if (mapRef.current || initializingRef.current) return;

    initializingRef.current = true;

    // Leaflet must only run client-side — dynamic import avoids SSR errors
    import("leaflet")
      .then((L) => {
        // Double-check after async import
        if (!containerRef.current) {
          initializingRef.current = false;
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((containerRef.current as any)._leaflet_id) {
          initializingRef.current = false;
          return;
        }
        if (mapRef.current) {
          initializingRef.current = false;
          return;
        }

        // Fix default icon paths broken by webpack
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(containerRef.current!, {
          center: VSU_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: false, // we use custom buttons
          attributionControl: false,
          maxBounds: MAP_BOUNDS, // Restrict panning to the defined area
          maxBoundsViscosity: 1.0, // Make bounds "solid" - prevents dragging outside
          minZoom: 13, // Prevent zooming out too far
          maxZoom: 18, // Allow zooming in for detail
        });

        // Tile layer - will be updated by theme effect
        mapRef.current = map;
        setMapReady(true);
        initializingRef.current = false;
      })
      .catch(() => {
        initializingRef.current = false;
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
      initializingRef.current = false;
    };
  }, []);

  // ── 1b. Update tile layer when theme changes ─────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    import("leaflet").then((L) => {
      const map = mapRef.current;

      // Remove existing tile layer
      map.eachLayer((layer: import("leaflet").Layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      // Add theme-appropriate tile layer
      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      // Bounded area rectangle - shows the restricted zone
      L.rectangle(MAP_BOUNDS, {
        color: "#38bdf8",
        fillColor: "#38bdf8",
        fillOpacity: isDark ? 0.02 : 0.04,
        weight: 2,
        dashArray: "8 6",
      }).addTo(map);

      // VSU campus center point
      L.circle(VSU_CENTER, {
        radius: 200,
        color: "#38bdf8",
        fillColor: "#38bdf8",
        fillOpacity: isDark ? 0.08 : 0.12,
        weight: 1.5,
      }).addTo(map);
    });
  }, [mapReady, isDark]);

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
      if (!map) return; // Additional null check

      // Remove existing markers (but keep tile layer + campus ring)
      map.eachLayer((layer: import("leaflet").Layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Student markers
      if (filter !== "centers") {
        const popupBg = isDark ? "#1e293b" : "#ffffff";
        const popupText = isDark ? "#f1f5f9" : "#0f172a";
        const popupBorder = isDark ? "#334155" : "#e2e8f0";
        const popupSecondary = isDark ? "#94a3b8" : "#64748b";

        // Filter students by selected status
        const filteredStudents = locatedStudents.filter((student) => 
          student.last_status === filter || (!student.last_status && filter === "UNKNOWN")
        );

        filteredStudents.forEach((student) => {
          const icon = makeStudentIcon(L, student.last_status ?? "UNKNOWN");
          const marker = L.marker([student.last_known_lat!, student.last_known_lng!], {
            icon,
          });
          marker.bindPopup(
            `
            <div style="background:${popupBg};color:${popupText};padding:10px 12px;border-radius:8px;min-width:160px;border:1px solid ${popupBorder};font-family:system-ui,sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${student.name ?? "Unknown"}</div>
              <div style="font-size:11px;color:${popupSecondary};margin-bottom:6px">${student.student_id ?? ""}</div>
              <div style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${STATUS_COLORS[student.last_status ?? "UNKNOWN"]}22;color:${STATUS_COLORS[student.last_status ?? "UNKNOWN"]}">
                ${(student.last_status ?? "UNKNOWN").replace("_", " ")}
              </div>
              ${student.last_update_timestamp ? `<div style="font-size:10px;color:${popupSecondary};margin-top:6px">${new Date(student.last_update_timestamp).toLocaleString()}</div>` : ""}
            </div>
          `,
            { className: "leaflet-popup-dark" },
          );
          marker.addTo(map);
        });
      }

      // Evacuation center markers
      if (filter === "centers") {
        const popupBg = isDark ? "#1e293b" : "#ffffff";
        const popupText = isDark ? "#f1f5f9" : "#0f172a";
        const popupBorder = isDark ? "#334155" : "#e2e8f0";
        const popupSecondary = isDark ? "#94a3b8" : "#64748b";

        evacuationCenters.forEach((center) => {
          if (!center.latitude || !center.longitude) return;
          const icon = makeCenterIcon(L);
          const marker = L.marker([center.latitude, center.longitude], {
            icon,
          });
          marker.bindPopup(
            `
            <div style="background:${popupBg};color:${popupText};padding:10px 12px;border-radius:8px;min-width:160px;border:1px solid ${popupBorder};font-family:system-ui,sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${center.center_name ?? "Evacuation Center"}</div>
              <div style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:#a855f722;color:#a855f7">
                Evacuation Center
              </div>
            </div>
          `,
            { className: "leaflet-popup-dark" },
          );
          marker.addTo(map);
        });
      }
    });
  }, [mapReady, filter, locatedStudents, evacuationCenters, isDark]);

  // ── Custom zoom handlers ───────────────────────────────────────────────────
  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const resetView = () => mapRef.current?.setView(VSU_CENTER, DEFAULT_ZOOM);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: "centers", label: "Centers", Icon: Building2 },
              { key: "SAFE", label: "Safe", Icon: Users },
              { key: "NEEDS_ASSISTANCE", label: "Needs Assistance", Icon: Users },
              { key: "CRITICAL", label: "Critical", Icon: Users },
              { key: "EVACUATED", label: "Evacuated", Icon: Users },
              { key: "UNKNOWN", label: "Unknown", Icon: Users },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filter === key
                  ? "bg-cyan-500/20 text-cyan-500 border-cyan-500/40"
                  : "text-theme-text-secondary hover:text-theme-text-primary",
              )}
              style={
                filter !== key
                  ? { borderColor: "rgb(var(--border-primary))" }
                  : undefined
              }
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-theme-text-secondary">
          <span>
            <span className="text-theme-text-primary font-medium">
              {locatedStudents.length}
            </span>
            /{students.length} students located
          </span>
          <span>
            <span className="text-theme-text-primary font-medium">
              {evacuationCenters.length}
            </span>{" "}
            centers
          </span>
        </div>
      </div>

      {/* Map wrapper — explicit height is mandatory for Leaflet */}
      <div
        className="relative rounded-xl overflow-hidden border"
        style={{
          height: "520px",
          borderColor: "rgb(var(--border-primary))",
        }}
      >
        {/* Leaflet CSS — injected inline to avoid a separate global import */}
        <style>{`
          @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
          .leaflet-container { background: ${isDark ? "#0f172a" : "#f8fafc"}; }
          .leaflet-popup-content-wrapper,
          .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; }
          .leaflet-popup-content { margin: 0 !important; }
        `}</style>

        {/* The actual map div — must have explicit width & height */}
        <div
          key="leaflet-map-container"
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />

        {/* Custom zoom controls */}
        <div className="absolute top-3 right-3 z-1000 flex flex-col gap-1">
          {[
            { label: "+", action: zoomIn },
            { label: "−", action: zoomOut },
            { label: "⊙", action: resetView },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-8 h-8 rounded-lg backdrop-blur-sm transition-all flex items-center justify-center border text-sm font-bold"
              style={{
                backgroundColor: isDark
                  ? "rgba(24, 24, 27, 0.9)"
                  : "rgba(255, 255, 255, 0.9)",
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div
          className="absolute bottom-3 left-3 z-1000 backdrop-blur-sm border rounded-xl p-3"
          style={{
            backgroundColor: isDark
              ? "rgba(24, 24, 27, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
            borderColor: "rgb(var(--border-primary))",
          }}
        >
          <p className="text-[10px] font-semibold text-theme-text-tertiary uppercase tracking-widest mb-2">
            Legend
          </p>
          {LEGEND_ITEMS.map(({ label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 mb-1.5 last:mb-0"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-theme-text-secondary">{label}</span>
            </div>
          ))}
        </div>

        {/* Empty state overlay */}
        {mapReady && locatedStudents.filter((s) => s.last_status === filter || (!s.last_status && filter === "UNKNOWN")).length === 0 && filter !== "centers" && (
          <div className="absolute inset-0 flex items-center justify-center z-999 pointer-events-none">
            <div
              className="backdrop-blur-sm border rounded-xl px-6 py-4 text-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(24, 24, 27, 0.8)"
                  : "rgba(255, 255, 255, 0.8)",
                borderColor: "rgb(var(--border-primary))",
              }}
            >
              <Users
                size={28}
                className="text-theme-text-tertiary mx-auto mb-2"
              />
              <p className="text-sm text-theme-text-secondary">
                No students with GPS coordinates yet
              </p>
              <p className="text-xs text-theme-text-tertiary mt-1">
                Evacuation centers are shown in purple
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

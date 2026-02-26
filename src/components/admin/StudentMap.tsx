"use client";

import { useEffect, useRef, useState } from "react";
import type { Student, EvacuationCenter } from "@/types";
import { STATUS_CONFIG } from "@/lib/utils";
import { Users, Building2, ZoomIn, ZoomOut, Crosshair } from "lucide-react";
import { cn } from "@/lib/cn";

// VSU Baybay City coordinates
const VSU_CENTER: [number, number] = [10.7423, 124.7942];
const VSU_RADIUS_KM = 3;

interface StudentMapProps {
  students: Student[];
  evacuationCenters: EvacuationCenter[];
}

type MapFilter = "all" | "students" | "evacuation";

// Status to Leaflet color mapping
const STATUS_COLORS: Record<string, string> = {
  SAFE: "#34d399",
  NEEDS_ASSISTANCE: "#fbbf24",
  CRITICAL: "#f87171",
  EVACUATED: "#38bdf8",
  UNKNOWN: "#94a3b8",
};

export default function StudentMap({
  students,
  evacuationCenters,
}: StudentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MapFilter>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState({ total: 0, withLocation: 0 });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (SSR safe)
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: VSU_CENTER,
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      });

      // Dark tile layer matching dashboard aesthetic
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(map);

      // VSU campus radius circle
      L.circle(VSU_CENTER, {
        color: "#38bdf8",
        fillColor: "#38bdf8",
        fillOpacity: 0.03,
        weight: 1.5,
        opacity: 0.4,
        radius: VSU_RADIUS_KM * 1000,
        dashArray: "6 4",
      }).addTo(map);

      // VSU center marker
      const vsuIcon = L.divIcon({
        html: `<div style="
          background: #1e40af;
          border: 2px solid #38bdf8;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          box-shadow: 0 0 12px rgba(56,189,248,0.6);
        "></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker(VSU_CENTER, { icon: vsuIcon })
        .addTo(map)
        .bindPopup('<b style="color:#38bdf8">VSU Baybay Campus</b>');

      mapInstanceRef.current = map;
      setIsLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when students/centers change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      const studentsWithLocation = students.filter(
        (s) => s.latitude && s.longitude,
      );
      setStats({
        total: students.length,
        withLocation: studentsWithLocation.length,
      });

      // Add student markers
      if (activeFilter !== "evacuation") {
        studentsWithLocation.forEach((student) => {
          const status = student.current_status ?? "UNKNOWN";
          const color = STATUS_COLORS[status] ?? STATUS_COLORS.UNKNOWN;

          const icon = L.divIcon({
            html: `<div style="
              background: ${color};
              border: 2px solid rgba(255,255,255,0.3);
              border-radius: 50%;
              width: 12px;
              height: 12px;
              box-shadow: 0 0 8px ${color}80;
              cursor: pointer;
            "></div>`,
            className: "",
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          const marker = L.marker([student.latitude!, student.longitude!], {
            icon,
          }).addTo(map).bindPopup(`
              <div style="font-family: system-ui; min-width: 160px;">
                <p style="font-weight: 600; margin: 0 0 4px; color: #e2e8f0;">${student.name}</p>
                <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px;">${student.student_id}</p>
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  font-size: 11px;
                  font-weight: 600;
                  background: ${color}20;
                  color: ${color};
                  border: 1px solid ${color}40;
                ">${cfg?.label ?? status}</span>
              </div>
            `);

          markersRef.current.push(marker);
        });
      }

      // Add evacuation center markers
      if (activeFilter !== "students") {
        evacuationCenters.forEach((center) => {
          if (!center.latitude || !center.longitude) return;

          const pct =
            center.capacity > 0
              ? Math.round((center.current_occupancy / center.capacity) * 100)
              : 0;
          const capColor =
            pct >= 90 ? "#f87171" : pct >= 70 ? "#fbbf24" : "#34d399";

          const icon = L.divIcon({
            html: `<div style="
              background: #7c3aed;
              border: 2px solid #a78bfa;
              border-radius: 4px;
              width: 14px;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: bold;
              color: white;
              box-shadow: 0 0 8px rgba(124,58,237,0.6);
            ">E</div>`,
            className: "",
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const marker = L.marker([center.latitude, center.longitude], {
            icon,
          }).addTo(map).bindPopup(`
              <div style="font-family: system-ui; min-width: 180px;">
                <p style="font-weight: 600; margin: 0 0 4px; color: #e2e8f0;">${center.name}</p>
                <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px;">${center.address}</p>
                <div style="display:flex; justify-content:space-between; font-size:11px;">
                  <span style="color:#94a3b8">Capacity</span>
                  <span style="color:${capColor}; font-weight:600">${center.current_occupancy}/${center.capacity} (${pct}%)</span>
                </div>
              </div>
            `);

          markersRef.current.push(marker);
        });
      }
    });
  }, [isLoaded, students, evacuationCenters, activeFilter]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleCenter = () => mapInstanceRef.current?.setView(VSU_CENTER, 14);

  const filterButtons: {
    key: MapFilter;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: "all", label: "All", icon: Crosshair },
    { key: "students", label: "Students", icon: Users },
    { key: "evacuation", label: "Centers", icon: Building2 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex gap-1.5">
          {filterButtons.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition-all",
                activeFilter === key
                  ? "bg-sky-500/10 text-sky-400 ring-sky-500/30"
                  : "bg-transparent text-slate-500 ring-white/5 hover:text-slate-300 hover:bg-white/5",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            <span className="text-slate-300 font-semibold">
              {stats.withLocation}
            </span>
            /{stats.total} students located
          </span>
          <span>
            <span className="text-slate-300 font-semibold">
              {evacuationCenters.length}
            </span>{" "}
            centers
          </span>
        </div>
      </div>

      {/* Map container */}
      <div
        className="relative rounded-xl overflow-hidden ring-1 ring-white/5"
        style={{ height: "520px" }}
      >
        {/* Custom zoom controls */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0f1623]/90 backdrop-blur ring-1 ring-white/10 text-slate-300 hover:text-white hover:bg-[#161e2e] transition"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0f1623]/90 backdrop-blur ring-1 ring-white/10 text-slate-300 hover:text-white hover:bg-[#161e2e] transition"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCenter}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0f1623]/90 backdrop-blur ring-1 ring-white/10 text-slate-300 hover:text-sky-400 hover:bg-[#161e2e] transition"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-[#0b1018]/90 backdrop-blur ring-1 ring-white/10 p-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Legend
          </p>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
              />
              <span className="text-[11px] text-slate-400">
                {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ??
                  status}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <span
              className="h-2.5 w-2.5 rounded-sm flex-shrink-0 bg-violet-500"
              style={{ boxShadow: "0 0 6px rgba(124,58,237,0.6)" }}
            />
            <span className="text-[11px] text-slate-400">
              Evacuation Center
            </span>
          </div>
        </div>

        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-[#0b1018]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading map…</p>
            </div>
          </div>
        )}

        {/* Leaflet map */}
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* No location warning */}
      {stats.total > 0 && stats.withLocation === 0 && (
        <p className="text-xs text-amber-400/70 text-center">
          No students have location data yet. Location is populated when
          students report via the app.
        </p>
      )}
    </div>
  );
}

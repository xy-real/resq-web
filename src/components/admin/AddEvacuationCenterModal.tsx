"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface AddEvacuationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Map bounds - same as StudentMap
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

export default function AddEvacuationCenterModal({
  isOpen,
  onClose,
  onSuccess,
}: AddEvacuationCenterModalProps) {
  const [centerName, setCenterName] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (!mounted || !mapContainerRef.current) return;

        // Clear existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Create map
        const map = L.map(mapContainerRef.current, {
          center: VSU_CENTER,
          zoom: DEFAULT_ZOOM,
          maxBounds: MAP_BOUNDS,
          maxBoundsViscosity: 1.0,
          minZoom: 13,
          maxZoom: 18,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Add tile layer
        const isDark = theme === "dark";
        const tileUrl = isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        L.tileLayer(tileUrl, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add click handler
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          setLatitude(Number(lat.toFixed(6)));
          setLongitude(Number(lng.toFixed(6)));

          // Add or update marker
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const icon = L.divIcon({
              html: `
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
                  <circle cx="17" cy="17" r="13" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="2"/>
                  <text x="17" y="22" text-anchor="middle" font-size="13" font-weight="700"
                        font-family="system-ui,sans-serif" fill="#a855f7">E</text>
                </svg>`,
              className: "",
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            });

            markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
          }
        });

        // Allow time for map to load
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, [isOpen, theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!centerName.trim()) {
      toast.error("Please enter a center name");
      return;
    }

    if (latitude === "" || longitude === "") {
      toast.error("Please select a location on the map");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/evacuation-centers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_name: centerName,
          latitude: Number(latitude),
          longitude: Number(longitude),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create evacuation center");
      }

      toast.success("Evacuation center added successfully");
      setCenterName("");
      setLatitude("");
      setLongitude("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding evacuation center:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add evacuation center",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl rounded-xl ring-1 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: "rgb(var(--bg-secondary))",
          borderColor: "rgb(var(--border-primary))",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "rgb(var(--border-primary))" }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <MapPin className="h-5 w-5 text-purple-400" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-text-primary font-inter">
                Add Evacuation Center
              </h3>
              <p className="text-sm text-theme-text-secondary mt-0.5">
                Click on the map to select location
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-interactive-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {/* Center Name Input */}
            <div>
              <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
                Center Name
              </label>
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="e.g., VSU Main Gymnasium"
                className="w-full px-4 py-2.5 rounded-lg text-base transition-all border font-krub"
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  borderColor: "rgb(var(--border-primary))",
                  color: "rgb(var(--text-primary))",
                }}
              />
            </div>

            {/* Map */}
            <div>
              <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
                Location
              </label>
              <div
                ref={mapContainerRef}
                className="w-full h-64 rounded-lg overflow-hidden ring-1"
                style={{ borderColor: "rgb(var(--border-primary))" }}
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) =>
                    setLatitude(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="10.7xxxxx"
                  className="w-full px-4 py-2.5 rounded-lg text-base transition-all border font-mono"
                  style={{
                    backgroundColor: "rgb(var(--bg-primary))",
                    borderColor: "rgb(var(--border-primary))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) =>
                    setLongitude(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="124.7xxxxx"
                  className="w-full px-4 py-2.5 rounded-lg text-base transition-all border font-mono"
                  style={{
                    backgroundColor: "rgb(var(--bg-primary))",
                    borderColor: "rgb(var(--border-primary))",
                    color: "rgb(var(--text-primary))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 p-6 border-t"
            style={{ borderColor: "rgb(var(--border-primary))" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border font-inter hover:bg-theme-interactive-hover disabled:opacity-40"
              style={{
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all bg-purple-500 hover:bg-purple-600 text-white font-inter disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Adding..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

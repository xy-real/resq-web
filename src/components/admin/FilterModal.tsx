"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StudentStatus, UpdateSource } from "@/types";

export interface FilterState {
  source: "all" | UpdateSource;
  validation: "all" | "valid" | "invalid";
  status: "all" | StudentStatus;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: FilterModalProps) {
  if (!isOpen) return null;

  const handleSourceChange = (source: FilterState["source"]) => {
    onFiltersChange({ ...filters, source });
  };

  const handleValidationChange = (validation: FilterState["validation"]) => {
    onFiltersChange({ ...filters, validation });
  };

  const handleStatusChange = (status: FilterState["status"]) => {
    onFiltersChange({ ...filters, status });
  };

  const handleReset = () => {
    onFiltersChange({
      source: "all",
      validation: "all",
      status: "all",
    });
  };

  const FilterButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-semibold transition-all font-inter",
        active
          ? "bg-sky-500 text-white"
          : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-interactive-hover border",
      )}
      style={
        !active ? { borderColor: "rgb(var(--border-primary))" } : undefined
      }
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl ring-1 shadow-2xl p-6 mx-4"
        style={{
          backgroundColor: "rgb(var(--bg-secondary))",
          borderColor: "rgb(var(--border-primary))",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-theme-text-primary font-inter">
            Filters
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-theme-text-tertiary hover:text-theme-text-primary hover:bg-theme-interactive-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Sections */}
        <div className="space-y-6">
          {/* Source */}
          <div>
            <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
              Source:
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filters.source === "all"}
                onClick={() => handleSourceChange("all")}
              >
                All
              </FilterButton>
              <FilterButton
                active={filters.source === "APP"}
                onClick={() => handleSourceChange("APP")}
              >
                App
              </FilterButton>
              <FilterButton
                active={filters.source === "SMS"}
                onClick={() => handleSourceChange("SMS")}
              >
                SMS
              </FilterButton>
            </div>
          </div>

          {/* Validation */}
          <div>
            <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
              Validation:
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filters.validation === "all"}
                onClick={() => handleValidationChange("all")}
              >
                All
              </FilterButton>
              <FilterButton
                active={filters.validation === "valid"}
                onClick={() => handleValidationChange("valid")}
              >
                Valid
              </FilterButton>
              <FilterButton
                active={filters.validation === "invalid"}
                onClick={() => handleValidationChange("invalid")}
              >
                Invalid
              </FilterButton>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-theme-text-primary mb-2 font-inter">
              Status:
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={filters.status === "all"}
                onClick={() => handleStatusChange("all")}
              >
                All
              </FilterButton>
              <FilterButton
                active={filters.status === "SAFE"}
                onClick={() => handleStatusChange("SAFE")}
              >
                Safe
              </FilterButton>
              <FilterButton
                active={filters.status === "NEEDS_ASSISTANCE"}
                onClick={() => handleStatusChange("NEEDS_ASSISTANCE")}
              >
                Needs Assistance
              </FilterButton>
              <FilterButton
                active={filters.status === "CRITICAL"}
                onClick={() => handleStatusChange("CRITICAL")}
              >
                Critical
              </FilterButton>
              <FilterButton
                active={filters.status === "EVACUATED"}
                onClick={() => handleStatusChange("EVACUATED")}
              >
                Evacuated
              </FilterButton>
              <FilterButton
                active={filters.status === "UNKNOWN"}
                onClick={() => handleStatusChange("UNKNOWN")}
              >
                Unknown
              </FilterButton>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="flex items-center gap-3 mt-6 pt-6 border-t"
          style={{ borderColor: "rgb(var(--border-primary))" }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border font-inter hover:bg-theme-interactive-hover"
            style={{
              borderColor: "rgb(var(--border-primary))",
              color: "rgb(var(--text-primary))",
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-sky-500 hover:bg-sky-600 text-white font-inter"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

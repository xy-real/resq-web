"use client";

import { useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { StudentStatus } from "@/types";

const SMS_CODES: {
  code: string;
  status: StudentStatus;
  label: string;
  color: string;
}[] = [
  { code: "SAFE", status: "SAFE", label: "Safe", color: "text-emerald-400" },
  {
    code: "NEEDS",
    status: "NEEDS_ASSISTANCE",
    label: "Needs Assistance",
    color: "text-amber-400",
  },
  {
    code: "CRITICAL",
    status: "CRITICAL",
    label: "Critical",
    color: "text-red-400",
  },
  {
    code: "EVAC",
    status: "EVACUATED",
    label: "Evacuated",
    color: "text-sky-400",
  },
];

interface LogEntry {
  id: string;
  raw: string;
  parsed: { studentId: string; status: StudentStatus } | null;
  success: boolean;
  timestamp: Date;
}

export default function SMSGatewaySimulator() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseMessage = (
    msg: string,
  ): { studentId: string; status: StudentStatus } | null => {
    const parts = msg.trim().toUpperCase().split(/\s+/);
    if (parts.length < 3 || parts[0] !== "VSU") return null;
    const studentId = parts[1];
    const code = parts[2];
    const match = SMS_CODES.find((s) => s.code === code);
    if (!match) return null;
    return { studentId, status: match.status };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate processing

    const parsed = parseMessage(input);
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      raw: input,
      parsed,
      success: !!parsed,
      timestamp: new Date(),
    };

    setLog((prev) => [entry, ...prev].slice(0, 50));
    setInput("");
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div
        className="rounded-xl ring-1 p-5 space-y-4"
        style={{
          backgroundColor: "rgb(var(--bg-secondary))",
          borderColor: "rgb(var(--border-primary))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-sky-500/10 p-2.5">
            <MessageSquare className="h-5 w-5 text-sky-400" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-theme-text-primary">
              SMS Gateway Simulator
            </p>
            <p className="text-xs text-theme-text-secondary">
              Test SMS-based status updates without internet connectivity
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        </div>

        {/* Format guide */}
        <div
          className="rounded-lg p-4 font-mono text-sm"
          style={{ backgroundColor: "rgb(var(--bg-tertiary))" }}
        >
          <p className="text-theme-text-secondary text-xs mb-2 font-sans font-semibold uppercase tracking-wider">
            Message Format
          </p>
          <p className="text-sky-300">
            VSU <span className="text-amber-300">[StudentID]</span>{" "}
            <span className="text-emerald-300">[STATUS_CODE]</span>
          </p>
          <p className="mt-3 text-xs text-theme-text-tertiary font-sans">
            Example:
          </p>
          <p className="text-theme-text-primary">VSU 2024-0001 SAFE</p>
        </div>

        {/* Status codes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SMS_CODES.map(({ code, label, color }) => (
            <div
              key={code}
              className="rounded-lg px-3 py-2 text-center"
              style={{ backgroundColor: "rgb(var(--bg-tertiary))" }}
            >
              <p className={cn("font-mono text-sm font-bold", color)}>{code}</p>
              <p className="text-[11px] text-theme-text-tertiary mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
          <input
            type="text"
            placeholder="VSU 2024-0001 SAFE"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm font-mono text-theme-text-primary placeholder:text-theme-text-tertiary ring-1 focus:outline-none focus:ring-sky-500/50 transition"
            style={{
              backgroundColor: "rgb(var(--bg-secondary))",
              borderColor: "rgb(var(--border-primary))",
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isProcessing || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-theme-text-tertiary">
            Message Log
          </p>
          <div
            className="rounded-xl ring-1 overflow-hidden"
            style={{ borderColor: "rgb(var(--border-primary))" }}
          >
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 transition border-b"
                style={{
                  backgroundColor: "rgb(var(--bg-tertiary))",
                  borderColor: "rgb(var(--border-secondary))",
                }}
              >
                {entry.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                )}
                <span className="font-mono text-sm text-theme-text-primary flex-1 truncate">
                  {entry.raw}
                </span>
                {entry.parsed && (
                  <span className="text-xs text-theme-text-tertiary">
                    ID:{" "}
                    <span className="text-theme-text-primary">
                      {entry.parsed.studentId}
                    </span>
                  </span>
                )}
                {!entry.success && (
                  <span className="text-xs text-red-400">Invalid format</span>
                )}
                <span className="text-[10px] text-theme-text-secondary tabular-nums whitespace-nowrap">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

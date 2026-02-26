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
      <div className="rounded-xl bg-[#0f1623] ring-1 ring-white/5 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-sky-500/10 p-2.5">
            <MessageSquare className="h-5 w-5 text-sky-400" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-slate-200">
              SMS Gateway Simulator
            </p>
            <p className="text-xs text-slate-400">
              Test SMS-based status updates without internet connectivity
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
        </div>

        {/* Format guide */}
        <div className="rounded-lg bg-[#0b1018] p-4 font-mono text-sm">
          <p className="text-slate-400 text-xs mb-2 font-sans font-semibold uppercase tracking-wider">
            Message Format
          </p>
          <p className="text-sky-300">
            VSU <span className="text-amber-300">[StudentID]</span>{" "}
            <span className="text-emerald-300">[STATUS_CODE]</span>
          </p>
          <p className="mt-3 text-xs text-slate-500 font-sans">Example:</p>
          <p className="text-slate-300">VSU 2024-0001 SAFE</p>
        </div>

        {/* Status codes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SMS_CODES.map(({ code, label, color }) => (
            <div
              key={code}
              className="rounded-lg bg-[#0b1018] px-3 py-2 text-center"
            >
              <p className={cn("font-mono text-sm font-bold", color)}>{code}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="VSU 2024-0001 SAFE"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full rounded-lg bg-[#0f1623] pl-9 pr-4 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 ring-1 ring-white/5 focus:outline-none focus:ring-sky-500/50 transition"
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
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Message Log
          </p>
          <div className="rounded-xl ring-1 ring-white/5 overflow-hidden divide-y divide-white/[0.03]">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3 bg-[#0b1018] hover:bg-[#0f1623] transition"
              >
                {entry.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                )}
                <span className="font-mono text-sm text-slate-300 flex-1 truncate">
                  {entry.raw}
                </span>
                {entry.parsed && (
                  <span className="text-xs text-slate-500">
                    ID:{" "}
                    <span className="text-slate-300">
                      {entry.parsed.studentId}
                    </span>
                  </span>
                )}
                {!entry.success && (
                  <span className="text-xs text-red-400">Invalid format</span>
                )}
                <span className="text-[10px] text-slate-600 tabular-nums whitespace-nowrap">
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

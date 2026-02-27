/**
 * API client abstraction layer.
 * Replace `base44` calls here with your actual Next.js API routes
 * (e.g. fetch('/api/students')) or a real SDK import.
 *
 * Every function returns a typed Promise so the rest of the app
 * stays framework-agnostic and easy to test.
 */

import type {
  Student,
  EvacuationCenter,
  SystemSettings,
  StatusLog,
  StudentStatus,
} from '@/types';

// ─── Students ────────────────────────────────────────────────────────────────

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch('/api/students?sort=-updated_date');
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function updateStudentStatus(
  studentId: string,
  status: StudentStatus,
): Promise<Student> {
  const res = await fetch(`/api/students/${studentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      last_status: status,
      source: 'ADMIN',
    }),
  });
  if (!res.ok) throw new Error('Failed to update student status');
  return res.json();
}

// ─── Evacuation Centers ───────────────────────────────────────────────────────

export async function fetchActiveEvacuationCenters(): Promise<EvacuationCenter[]> {
  const res = await fetch('/api/evacuation-centers?is_active=true');
  if (!res.ok) throw new Error('Failed to fetch evacuation centers');
  return res.json();
}

// ─── System Settings ──────────────────────────────────────────────────────────

export async function fetchDisasterMode(): Promise<boolean> {
  const res = await fetch('/api/settings/disaster_mode');
  if (!res.ok) return false;
  const data: SystemSettings = await res.json();
  return data.is_active ?? false;
}

export async function setDisasterMode(isActive: boolean): Promise<void> {
  const res = await fetch('/api/settings/disaster_mode', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!res.ok) throw new Error('Failed to update disaster mode');
}

// ─── Status Logs ─────────────────────────────────────────────────────────────

export async function createStatusLog(
  payload: Omit<StatusLog, 'id' | 'created_at'>,
): Promise<StatusLog> {
  const res = await fetch('/api/status-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create status log');
  return res.json();
}

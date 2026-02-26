import type { Student, DashboardStats, StudentStatus } from '@/types';

export function computeStats(students: Student[]): DashboardStats {
  const count = (status: StudentStatus) =>
    students.filter((s) => s.current_status === status).length;

  return {
    total: students.length,
    SAFE: count('SAFE'),
    NEEDS_ASSISTANCE: count('NEEDS_ASSISTANCE'),
    CRITICAL: count('CRITICAL'),
    EVACUATED: count('EVACUATED'),
    UNKNOWN: students.filter(
      (s) => !s.current_status || s.current_status === 'UNKNOWN',
    ).length,
  };
}

export function filterStudents(
  students: Student[],
  filter: string,
): Student[] {
  if (filter === 'all') return students;
  if (filter === 'UNKNOWN') {
    return students.filter(
      (s) => !s.current_status || s.current_status === 'UNKNOWN',
    );
  }
  return students.filter((s) => s.current_status === filter);
}

export const STATUS_CONFIG: Record<
  StudentStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  SAFE: {
    label: 'Safe',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/30',
  },
  NEEDS_ASSISTANCE: {
    label: 'Needs Assistance',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/30',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    ring: 'ring-red-500/30',
  },
  EVACUATED: {
    label: 'Evacuated',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    ring: 'ring-sky-500/30',
  },
  UNKNOWN: {
    label: 'Unknown',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/30',
  },
};

export function formatTimestamp(ts: string | null): string {
  if (!ts) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts));
}

// ============================================================================
// ResQ Database Types - Aligned with ERD Schema
// ============================================================================

export type StudentStatus =
  | 'SAFE'
  | 'NEEDS_ASSISTANCE'
  | 'CRITICAL'
  | 'EVACUATED'
  | 'UNKNOWN';

export type UpdateSource = 'SMS' | 'APP' | 'ADMIN';

// ─── Students Table ─────────────────────────────────────────────────────────

export interface Student {
  student_id: string; // PRIMARY KEY - university ID
  user_id: string; // FK to auth.users
  email: string;
  name: string;
  contact_number?: string;
  home_lat?: number;
  home_lng?: number;
  registered_home_risk_label?: string;
  last_known_lat?: number;
  last_known_lng?: number;
  last_status: StudentStatus;
  last_update_timestamp?: string;
  last_update_source?: UpdateSource;
}

// ─── Status Logs Table ──────────────────────────────────────────────────────

export interface StatusLog {
  id: string; // UUID
  student_id: string; // FK to students.student_id
  status: StudentStatus;
  timestamp: string;
  source: UpdateSource;
  validation_flag: boolean;
}

// ─── Evacuation Centers Table ───────────────────────────────────────────────

export interface EvacuationCenter {
  id: string; // UUID
  center_name: string;
  latitude: number;
  longitude: number;
}

// ─── System Settings Table (Singleton) ──────────────────────────────────────

export interface SystemSettings {
  id: number; // Always 1
  is_active: boolean;
  activated_at?: string;
}

// ─── Admins Table ───────────────────────────────────────────────────────────

export interface Admin {
  id: string; // UUID
  user_id: string; // FK to auth.users
  email: string;
  name?: string;
}

// ─── Dashboard & Analytics Types ────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  SAFE: number;
  NEEDS_ASSISTANCE: number;
  CRITICAL: number;
  EVACUATED: number;
  UNKNOWN: number;
}

export type FilterType = StudentStatus | 'all';

// ─── Auth & User Types ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  student_id?: string; // Only for students
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
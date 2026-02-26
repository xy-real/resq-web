export type StudentStatus =
  | 'SAFE'
  | 'NEEDS_ASSISTANCE'
  | 'CRITICAL'
  | 'EVACUATED'
  | 'UNKNOWN';

export interface Student {
  id: string;
  student_id: string;
  name: string;
  current_status: StudentStatus | null;
  last_update_timestamp: string | null;
  last_update_source: 'SMS' | 'APP' | 'ADMIN' | null;
  contact_number?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  updated_date: string;
}

export interface EvacuationCenter {
  id: string;
  name: string;
  address: string;
  capacity: number;
  current_occupancy: number;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SystemSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
}

export interface StatusLog {
  id: string;
  student_id: string;
  status: StudentStatus;
  source: 'SMS' | 'APP' | 'ADMIN';
  is_valid: boolean;
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  SAFE: number;
  NEEDS_ASSISTANCE: number;
  CRITICAL: number;
  EVACUATED: number;
  UNKNOWN: number;
}

export type FilterType = StudentStatus | 'all';
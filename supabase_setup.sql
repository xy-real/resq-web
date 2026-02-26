-- ============================================================================
-- ResQ Disaster Response System - Database Setup Script
-- ============================================================================
-- Execute this script in your Supabase SQL Editor
-- Go to: https://app.supabase.com > SQL Editor > New Query
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- ─── Students Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT,
  home_lat DECIMAL(10,8),
  home_lng DECIMAL(11,8),
  registered_home_risk_label TEXT,
  last_known_lat DECIMAL(10,8),
  last_known_lng DECIMAL(11,8),
  last_status TEXT DEFAULT 'UNKNOWN' CHECK (last_status IN ('SAFE', 'NEEDS_ASSISTANCE', 'CRITICAL', 'EVACUATED', 'UNKNOWN')),
  last_update_timestamp TIMESTAMPTZ,
  last_update_source TEXT CHECK (last_update_source IN ('APP', 'SMS', 'ADMIN'))
);

-- ─── Status Logs Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('SAFE', 'NEEDS_ASSISTANCE', 'CRITICAL', 'EVACUATED', 'UNKNOWN')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('APP', 'SMS', 'ADMIN')),
  validation_flag BOOLEAN DEFAULT TRUE
);

-- ─── Evacuation Centers Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evacuation_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL
);

-- ─── System Settings Table (Singleton) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_disaster_mode_active BOOLEAN DEFAULT FALSE,
  mode_activated_at TIMESTAMPTZ,
  CONSTRAINT singleton_check CHECK (id = 1)
);

-- Insert initial row
INSERT INTO system_settings (id, is_disaster_mode_active)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─── Admins Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_last_status ON students(last_status);
CREATE INDEX IF NOT EXISTS idx_students_last_update ON students(last_update_timestamp DESC);

-- Status logs indexes
CREATE INDEX IF NOT EXISTS idx_status_logs_student_id ON status_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_timestamp ON status_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_status_logs_student_valid ON status_logs(student_id, timestamp DESC) WHERE validation_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_status_logs_source ON status_logs(source);

-- Admins indexes
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- ─── Enable RLS ─────────────────────────────────────────────────────────────
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evacuation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ─── Students Table Policies ────────────────────────────────────────────────

-- Students can view their own record
CREATE POLICY students_select_own ON students
  FOR SELECT
  USING (auth.uid() = user_id);

-- Students can insert their own record during registration
CREATE POLICY students_insert_own ON students
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own status and location
CREATE POLICY students_update_own_status ON students
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all students
CREATE POLICY admins_select_all_students ON students
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Admins can update all students
CREATE POLICY admins_update_all_students ON students
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- ─── Status Logs Table Policies ─────────────────────────────────────────────

-- Students can insert their own logs
CREATE POLICY students_insert_own_logs ON status_logs
  FOR INSERT
  WITH CHECK (
    student_id IN (SELECT s.student_id FROM students s WHERE s.user_id = auth.uid())
  );

-- Students can view their own logs
CREATE POLICY students_select_own_logs ON status_logs
  FOR SELECT
  USING (
    student_id IN (SELECT s.student_id FROM students s WHERE s.user_id = auth.uid())
  );

-- Admins can view all logs
CREATE POLICY admins_select_all_logs ON status_logs
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Admins can insert logs
CREATE POLICY admins_insert_logs ON status_logs
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- ─── Evacuation Centers Table Policies ──────────────────────────────────────

-- All authenticated users can view evacuation centers
CREATE POLICY public_select_centers ON evacuation_centers
  FOR SELECT
  USING (true);

-- Admins can manage evacuation centers
CREATE POLICY admins_insert_centers ON evacuation_centers
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY admins_update_centers ON evacuation_centers
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY admins_delete_centers ON evacuation_centers
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- ─── System Settings Table Policies ─────────────────────────────────────────

-- All authenticated users can view settings
CREATE POLICY public_select_settings ON system_settings
  FOR SELECT
  USING (true);

-- Admins can update settings
CREATE POLICY admins_update_settings ON system_settings
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- ─── Admins Table Policies ──────────────────────────────────────────────────

-- Admins can view their own record
CREATE POLICY admins_select_own ON admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can insert their own record
CREATE POLICY admins_insert_own ON admins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage other admins
CREATE POLICY admins_insert_admins ON admins
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY admins_update_admins ON admins
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY admins_delete_admins ON admins
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- ─── Update Student Status Function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_student_status(
  p_student_id TEXT,
  p_status TEXT,
  p_source TEXT,
  p_lat DECIMAL DEFAULT NULL,
  p_lng DECIMAL DEFAULT NULL,
  p_validation BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
BEGIN
  -- Update student record
  UPDATE students
  SET 
    last_status = p_status,
    last_update_timestamp = NOW(),
    last_update_source = p_source,
    last_known_lat = COALESCE(p_lat, last_known_lat),
    last_known_lng = COALESCE(p_lng, last_known_lng)
  WHERE student_id = p_student_id;

  -- Insert log entry
  INSERT INTO status_logs (student_id, status, source, validation_flag)
  VALUES (p_student_id, p_status, p_source, p_validation);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Auto-Triage Students Function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_triage_students()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
  disaster_settings RECORD;
BEGIN
  -- Get disaster mode settings
  SELECT * INTO disaster_settings FROM system_settings WHERE id = 1;

  -- Only run if disaster mode is active
  IF NOT disaster_settings.is_disaster_mode_active THEN
    RETURN 0;
  END IF;

  -- Update students who haven't updated in 6 hours
  WITH updated AS (
    UPDATE students
    SET 
      last_status = 'UNKNOWN',
      last_update_timestamp = NOW(),
      last_update_source = 'ADMIN'
    WHERE 
      last_status != 'UNKNOWN'
      AND (
        last_update_timestamp < (disaster_settings.mode_activated_at + INTERVAL '6 hours')
        OR last_update_timestamp < (NOW() - INTERVAL '6 hours')
      )
    RETURNING student_id
  )
  SELECT COUNT(*) INTO updated_count FROM updated;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Get Dashboard Metrics Function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS TABLE(
  total BIGINT,
  safe BIGINT,
  needs_assistance BIGINT,
  critical BIGINT,
  evacuated BIGINT,
  unknown BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE last_status = 'SAFE')::BIGINT AS safe,
    COUNT(*) FILTER (WHERE last_status = 'NEEDS_ASSISTANCE')::BIGINT AS needs_assistance,
    COUNT(*) FILTER (WHERE last_status = 'CRITICAL')::BIGINT AS critical,
    COUNT(*) FILTER (WHERE last_status = 'EVACUATED')::BIGINT AS evacuated,
    COUNT(*) FILTER (WHERE last_status = 'UNKNOWN')::BIGINT AS unknown
  FROM students;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Toggle Disaster Mode Function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION toggle_disaster_mode(p_activate BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE system_settings
  SET 
    is_disaster_mode_active = p_activate,
    mode_activated_at = CASE 
      WHEN p_activate THEN NOW()
      ELSE mode_activated_at
    END
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample evacuation centers (uncomment to use)
/*
INSERT INTO evacuation_centers (center_name, latitude, longitude) VALUES
  ('VSU Gymnasium', 11.0041, 124.9595),
  ('VSU Student Center', 11.0045, 124.9600),
  ('VSU Freedom Park', 11.0050, 124.9605)
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- COMPLETE!
-- ============================================================================
-- Your database is now set up and ready to use.
-- Next steps:
-- 1. Create your first admin user through the signup flow
-- 2. Configure email authentication in Supabase Auth settings
-- 3. (Optional) Set up Google OAuth provider
-- ============================================================================

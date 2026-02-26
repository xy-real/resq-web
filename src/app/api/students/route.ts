import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/students
 * Fetch all students (admin only) or own student record
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('students')
      .select('*')
      .order('last_update_timestamp', { ascending: false, nullsFirst: false });

    // If not admin, only return own record
    if (!adminData) {
      query = query.eq('user_id', user.id);
    }

    const { data: students, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create a new student record (called during registration)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      student_id,
      name,
      email,
      contact_number,
      home_lat,
      home_lng,
      registered_home_risk_label,
    } = body;

    // Validate required fields
    if (!student_id || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, name, email' },
        { status: 400 }
      );
    }

    // Insert student record
    const { data: student, error } = await supabase
      .from('students')
      .insert({
        student_id,
        user_id: user.id,
        email,
        name,
        contact_number,
        home_lat,
        home_lng,
        registered_home_risk_label,
        last_status: 'UNKNOWN',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
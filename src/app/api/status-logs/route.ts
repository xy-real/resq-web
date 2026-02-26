import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/status-logs
 * Fetch status logs (admin can see all, students see only their own)
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
      .from('status_logs')
      .select(`
        *,
        students (
          name,
          email
        )
      `)
      .order('timestamp', { ascending: false });

    // If not admin, only return own logs
    if (!adminData) {
      // Get student_id for current user
      const { data: studentData } = await supabase
        .from('students')
        .select('student_id')
        .eq('user_id', user.id)
        .single();

      if (!studentData) {
        return NextResponse.json(
          { error: 'Student record not found' },
          { status: 404 }
        );
      }

      query = query.eq('student_id', studentData.student_id);
    }

    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const limit = searchParams.get('limit');

    if (studentId && adminData) {
      query = query.eq('student_id', studentId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (source) {
      query = query.eq('source', source);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching status logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/status-logs
 * Create a new status log entry
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
      status,
      source = 'APP',
      validation_flag = true,
    } = body;

    // Validate required fields
    if (!student_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: student_id, status' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['SAFE', 'NEEDS_ASSISTANCE', 'CRITICAL', 'EVACUATED', 'UNKNOWN'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Insert log entry
    const { data: log, error } = await supabase
      .from('status_logs')
      .insert({
        student_id,
        status,
        source,
        validation_flag,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating status log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

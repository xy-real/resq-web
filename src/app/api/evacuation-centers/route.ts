import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/evacuation-centers
 * Fetch all evacuation centers (accessible to all authenticated users)
 */
export async function GET() {
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

    const { data: centers, error } = await supabase
      .from('evacuation_centers')
      .select('*')
      .order('center_name');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(centers);
  } catch (error) {
    console.error('Error fetching evacuation centers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/evacuation-centers
 * Create a new evacuation center (admin only)
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

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminData) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { center_name, latitude, longitude } = body;

    // Validate required fields
    if (!center_name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: center_name, latitude, longitude' },
        { status: 400 }
      );
    }

    // Insert evacuation center
    const { data: center, error } = await supabase
      .from('evacuation_centers')
      .insert({
        center_name,
        latitude,
        longitude,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(center, { status: 201 });
  } catch (error) {
    console.error('Error creating evacuation center:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
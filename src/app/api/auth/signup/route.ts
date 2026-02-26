import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, studentId, contactNumber, isAdmin } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // 1. Invite user (creates auth user and sends verification email automatically)
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          student_id: studentId || null,
          contact_number: contactNumber || null,
        },
        redirectTo: `${request.nextUrl.origin}/auth/callback`,
      }
    );

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    if (!inviteData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    // 2. Update the user's password (invite doesn't set password directly)
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      inviteData.user.id,
      { password }
    );

    if (updateError) {
      // Rollback: delete user if password update fails
      await supabase.auth.admin.deleteUser(inviteData.user.id);
      return NextResponse.json(
        { error: `Failed to set password: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 3. Insert into students or admins table (bypasses RLS with service role)
    try {
      if (isAdmin) {
        const { error: insertError } = await supabase
          .from('admins')
          .insert({
            user_id: inviteData.user.id,
            email: email,
            name: name,
          });

        if (insertError) {
          // Rollback: delete auth user if table insert fails
          await supabase.auth.admin.deleteUser(inviteData.user.id);
          return NextResponse.json(
            { error: `Failed to create admin record: ${insertError.message}` },
            { status: 500 }
          );
        }
      } else {
        const { error: insertError } = await supabase
          .from('students')
          .insert({
            student_id: studentId,
            user_id: inviteData.user.id,
            email: email,
            name: name,
            contact_number: contactNumber,
            last_status: 'UNKNOWN',
          });

        if (insertError) {
          // Rollback: delete auth user if table insert fails
          await supabase.auth.admin.deleteUser(inviteData.user.id);
          return NextResponse.json(
            { error: `Failed to create student record: ${insertError.message}` },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { 
          user: {
            id: inviteData.user.id,
            email: inviteData.user.email,
          },
          message: 'Registration successful. Please check your email to verify your account.',
          requiresEmailVerification: true
        },
        { status: 201 }
      );

    } catch (dbError) {
      // Rollback auth user on any database error
      await supabase.auth.admin.deleteUser(inviteData.user.id);
      throw dbError;
    }

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

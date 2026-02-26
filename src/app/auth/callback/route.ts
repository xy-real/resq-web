import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * Auth callback handler for OAuth and email verification
 * This handles redirects from Google OAuth and email confirmation links
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (adminData) {
          // User is an admin, redirect to admin dashboard
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        }

        // Check if user is student
        const { data: studentData } = await supabase
          .from('students')
          .select('student_id')
          .eq('user_id', user.id)
          .single();

        if (studentData) {
          // User is a student, redirect to student dashboard
          return NextResponse.redirect(`${origin}/dashboard`);
        }

        // User authenticated via OAuth but not in admins/students table
        // Create admin entry for first-time OAuth users using admin client to bypass RLS
        const adminClient = createAdminClient();
        const { error: insertError } = await adminClient
          .from('admins')
          .insert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          });

        if (insertError) {
          console.error('Failed to create admin record:', insertError);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        // Successfully created admin entry, redirect to admin dashboard
        return NextResponse.redirect(`${origin}/admin/dashboard`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

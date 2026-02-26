import { createClient } from '@/lib/supabase/client';
import type { AuthError, User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  studentId?: string;
  name: string;
  contactNumber?: string;
  isAdmin?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | Error | null;
  message?: string;
}

/**
 * Sign up a new user with email and password
 * After signup, a record is automatically created in students or admins table
 * Uses server-side API route to bypass RLS and handle email verification
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    // Call server-side API route that uses service role key to bypass RLS
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
        studentId: data.studentId,
        contactNumber: data.contactNumber,
        isAdmin: data.isAdmin || false,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        user: null, 
        error: new Error(result.error || 'Registration failed') 
      };
    }

    // If email verification is required, return success without signing in
    if (result.requiresEmailVerification) {
      return { 
        user: null, 
        error: null,
        message: result.message
      };
    }

    // Otherwise, sign in the user to establish a session
    const supabase = createClient();
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      return { 
        user: null, 
        error: new Error('Account created but sign-in failed. Please sign in manually.') 
      };
    }

    return { user: authData.user, error: null };
  } catch (err) {
    return { 
      user: null, 
      error: err instanceof Error ? err : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return { user: null, error: authError };
    }

    return { user: authData.user, error: null };
  } catch (err) {
    return { 
      user: null, 
      error: err instanceof Error ? err : new Error('Unknown error occurred') 
    };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

/**
 * Get student data for the current user
 */
export async function getStudentProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Get admin data for the current user
 */
export async function getAdminProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Reset password - sends email with reset link
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { error };
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

# ResQ Authentication Setup Guide

## 🚀 Quick Start

The authentication system has been fully implemented using Supabase. Follow these steps to get started:

### 1. Configure Environment Variables

A template `.env.local` file has been created in the root directory. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings > API**
4. Copy the **Project URL** and **anon/public key**

### 2. Set Up Database Tables

The following tables need to be created in your Supabase database:

#### Students Table

```sql
CREATE TABLE students (
  student_id TEXT PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT,
  home_lat DECIMAL(10,8),
  home_lng DECIMAL(11,8),
  registered_home_risk_label TEXT,
  last_known_lat DECIMAL(10,8),
  last_known_lng DECIMAL(11,8),
  last_status TEXT DEFAULT 'UNKNOWN',
  last_update_timestamp TIMESTAMPTZ,
  last_update_source TEXT
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policies (see ERD documentation for full list)
CREATE POLICY students_select_own ON students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY students_insert_own ON students
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY students_update_own_status ON students
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Admins Table

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY admins_select_own ON admins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY admins_insert_own ON admins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Other Tables

Refer to the ERD documentation for:

- `status_logs`
- `evacuation_centers`
- `system_settings`

### 3. Configure Email Authentication

In Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Confirm email** to enabled

### 4. Configure Google OAuth

To enable Google Sign-In:

1. **Google OAuth Credentials (Already Created):**
   - Client ID: `594868454705-i8aq2sdbmikdlh40t0r1c81dephflh33.apps.googleusercontent.com`
   - This has been added to your `.env.local` file

2. **Configure in Supabase Dashboard:**
   - Go to **Authentication > Providers > Google**
   - Enable Google provider
   - Enter the Client ID: `594868454705-i8aq2sdbmikdlh40t0r1c81dephflh33.apps.googleusercontent.com`
   - Enter your Client Secret (from Google Cloud Console)
   - Save changes

3. **Important: Add Authorized Redirect URI in Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to your OAuth 2.0 Client ID
   - Add this redirect URI: `https://fljbgweerbqmgnnbgkyb.supabase.co/auth/v1/callback`
   - Save the changes

4. **For Local Development:**
   - Also add: `http://localhost:3000/auth/callback`
   - This allows testing on your local machine

### 5. Configure Redirect URLs

In Supabase Dashboard:

1. Go to **Authentication > URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### 6. Run the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to:

- `/signin` - Sign in page
- `/signup` - Student registration page

---

## 📋 Authentication Features

### ✅ Implemented Features

- **Email/Password Authentication**
  - Sign up with email verification
  - Sign in with credentials
  - Password validation (min 8 characters)
- **Google OAuth**
  - One-click Google sign-in
  - Automatic account linking
- **Protected Routes**
  - Middleware authentication
  - Automatic redirects for unauthenticated users
  - Role-based access (admin vs student)
- **Session Management**
  - Secure cookie-based sessions
  - Automatic session refresh
  - Sign out functionality

### 🔐 Security Features

- **Row-Level Security (RLS)**
  - Students can only access their own data
  - Admins have full access to all records
- **Password Security**
  - Passwords hashed by Supabase Auth
  - Never stored in plain text
- **Email Verification**
  - Required for email/password signups
  - Prevents fake accounts

---

## 🗂️ File Structure

```
src/
├── lib/
│   ├── auth.ts                 # Authentication helper functions
│   └── supabase/
│       ├── client.ts           # Client-side Supabase client
│       ├── server.ts           # Server-side Supabase client
│       └── middleware.ts       # Middleware authentication
├── app/
│   ├── signin/
│   │   └── page.tsx            # Sign-in page
│   ├── signup/
│   │   └── page.tsx            # Registration page
│   └── auth/
│       ├── callback/
│       │   └── route.ts        # OAuth callback handler
│       └── auth-code-error/
│           └── page.tsx        # Error page
├── components/
│   ├── LoginForm.tsx           # Login form with validation
│   └── SignUpForm.tsx          # Registration form
├── types/
│   └── index.ts                # TypeScript types (aligned with ERD)
└── middleware.ts               # Route protection

.env.local                      # Environment variables (you need to fill this)
```

---

## 🔧 API Functions

### Auth Functions (src/lib/auth.ts)

```typescript
// Sign up a new user
signUp({ email, password, studentId, name, contactNumber, isAdmin });

// Sign in with email/password
signIn({ email, password });

// Sign in with Google
signInWithGoogle();

// Sign out
signOut();

// Get current user
getCurrentUser();

// Check if user is admin
isAdmin(userId);

// Get student profile
getStudentProfile(userId);

// Reset password
resetPassword(email);
```

---

## 🚨 Troubleshooting

### "Invalid API key" error

- Verify your `.env.local` file has correct values
- Restart the dev server after changing environment variables

### Email verification not working

- Check Supabase email provider settings
- Verify email templates are configured
- Check spam folder

### OAuth redirect error

- Verify redirect URLs in Supabase dashboard
- Check Google OAuth credentials
- Ensure callback route exists: `/auth/callback`

### "User not found" after signup

- Check if RLS policies are enabled
- Verify student/admin record was created in database
- Check browser console for errors

---

## 📚 Next Steps

1. **Test Authentication Flow:**
   - Create a test student account
   - Verify email verification works
   - Test Google OAuth (if configured)
   - Test protected route access

2. **Configure Database Functions:**
   - Implement functions from ERD documentation:
     - `update_student_status()`
     - `auto_triage_students()`
     - `get_dashboard_metrics()`
     - `toggle_disaster_mode()`

3. **Set Up Admin Dashboard:**
   - Implement admin-only routes
   - Add admin user management
   - Configure disaster mode toggle

4. **Implement Student Features:**
   - Status update functionality
   - Location tracking
   - Emergency notifications

---

## 📖 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need Help?** Check the ERD documentation for complete database schema and RLS policies.

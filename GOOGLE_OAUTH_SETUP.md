# 🔐 Google OAuth Configuration Guide

## ✅ Current Status

Your Google OAuth Client ID has been configured in the application:

- **Client ID**: `594868454705-i8aq2sdbmikdlh40t0r1c81dephflh33.apps.googleusercontent.com`
- **Added to**: `.env.local` file

---

## 🚀 Required Setup Steps

### Step 1: Configure Supabase Dashboard

1. **Open your Supabase project**:
   - Go to https://fljbgweerbqmgnnbgkyb.supabase.co
   - Or visit: https://app.supabase.com

2. **Navigate to Authentication**:
   - Click **Authentication** in the sidebar
   - Click **Providers**
   - Find **Google** in the list

3. **Enable Google Provider**:
   - Toggle **Enable Sign in with Google** to ON
   - Enter your Client ID:
     ```
     594868454705-i8aq2sdbmikdlh40t0r1c81dephflh33.apps.googleusercontent.com
     ```
   - Enter your **Client Secret** (from Google Cloud Console)
   - Click **Save**

### Step 2: Configure Google Cloud Console

1. **Open Google Cloud Console**:
   - Go to https://console.cloud.google.com
   - Select your project

2. **Navigate to OAuth Credentials**:
   - Go to **APIs & Services** > **Credentials**
   - Click on your OAuth 2.0 Client ID
   - (The one ending in `.apps.googleusercontent.com`)

3. **Add Authorized Redirect URIs**:
   Add these two URIs:

   **Production:**

   ```
   https://fljbgweerbqmgnnbgkyb.supabase.co/auth/v1/callback
   ```

   **Local Development:**

   ```
   http://localhost:3000/auth/callback
   ```

4. **Save Changes**

### Step 3: Test the Integration

1. **Start your development server**:

   ```bash
   npm run dev
   ```

2. **Open the sign-in page**:
   - Go to http://localhost:3000/signin

3. **Click "Sign in with Google"**:
   - You should see a Google sign-in popup
   - Select your Google account
   - Grant permissions
   - You'll be redirected back to your app

---

## 🔧 How It Works

1. **User clicks "Sign in with Google"** on your app
2. **Supabase redirects** to Google's OAuth page
3. **User authenticates** with Google
4. **Google redirects back** to Supabase with auth code
5. **Supabase exchanges** the code for user info
6. **User is redirected** to your app (authenticated)

---

## 📋 Environment Variables

Your `.env.local` file now includes:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=594868454705-i8aq2sdbmikdlh40t0r1c81dephflh33.apps.googleusercontent.com
```

---

## 🎯 What Happens After Sign In

### For New Users (First-time Google Sign-in):

1. User authenticates with Google
2. Account is created in Supabase `auth.users`
3. User needs to complete registration:
   - Add student ID
   - Add contact number
   - Add other profile details
4. Record is inserted into `students` or `admins` table

### For Existing Users:

1. User authenticates with Google
2. Supabase matches email to existing account
3. User is redirected to their dashboard:
   - **Admins** → `/admin/dashboard`
   - **Students** → `/dashboard`

---

## 🔒 Security Notes

- ✅ Client ID is public (safe to expose in frontend)
- ⚠️ Client Secret is **PRIVATE** (never commit to Git)
- ✅ Supabase handles all OAuth security
- ✅ User passwords are never stored in your database
- ✅ Google tokens are managed by Supabase

---

## 🆘 Troubleshooting

### "Redirect URI mismatch" Error

→ Make sure you added the correct redirect URI in Google Cloud Console:

- `https://fljbgweerbqmgnnbgkyb.supabase.co/auth/v1/callback`

### "OAuth client not configured" Error

→ Check that Google provider is enabled in Supabase Dashboard

### User redirected to error page

→ Verify the callback route exists: `src/app/auth/callback/route.ts`

### "Access blocked" message from Google

→ Your OAuth app might be in testing mode. Add your email as a test user in Google Cloud Console

---

## 📚 Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- Your Project: https://fljbgweerbqmgnnbgkyb.supabase.co

---

## ✅ Verification Checklist

- [ ] Google Client ID added to Supabase Dashboard
- [ ] Google Client Secret added to Supabase Dashboard
- [ ] Google provider enabled in Supabase
- [ ] Redirect URIs configured in Google Cloud Console
- [ ] `.env.local` has correct Client ID
- [ ] Test sign-in on http://localhost:3000/signin
- [ ] Verify user creation in Supabase Auth dashboard
- [ ] Test logout and re-login

---

**Need help?** Check the `AUTH_SETUP.md` file for more detailed authentication setup instructions.

# ResQ Web 🚨

**ResQ Web** is a real-time emergency response and student safety tracking system designed to monitor and manage student safety during disasters or emergencies. Built for educational institutions, it provides an intuitive admin dashboard with interactive maps, real-time status updates, and evacuation center management.

## 🌟 Features

### For Administrators

- **Real-time Student Monitoring** - Track student safety status across multiple categories (Safe, Needs Assistance, Critical, Evacuated, Unknown)
- **Interactive Dashboard** - View statistics, filter logs, and monitor student locations
- **Disaster Mode Toggle** - System-wide emergency activation and deactivation
- **Evacuation Center Management** - Add and manage evacuation centers with interactive map selection
- **Status Log Filtering** - Filter by source (SMS/APP/ADMIN), validation flag, and status
- **Interactive Map View** - Visualize student locations and evacuation centers on a map with bounded area
- **Google OAuth Integration** - Secure authentication with automatic admin provisioning

### For Students

- **Status Reporting** - Update safety status via SMS or mobile app
- **Location Tracking** - Share current location during emergencies
- **Evacuation Information** - View nearest evacuation centers

### System Features

- **Dark/Light Mode** - Theme toggle for comfortable viewing in any environment
- **Real-time Updates** - Auto-refresh data every 30 seconds
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Type-safe** - Full TypeScript support with comprehensive type definitions

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Custom components with [next-themes](https://github.com/pacocoursey/next-themes)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **Supabase Account** (for database and authentication)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resq-web
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth (configured in Supabase)
# No additional env vars needed - handled by Supabase
```

**Where to find these values:**

- Log in to your [Supabase Dashboard](https://app.supabase.com/)
- Navigate to **Project Settings** > **API**
- Copy the **Project URL** and **anon/public** key
- Copy the **service_role** key (keep this secret!)

### 4. Database Setup

Execute the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Students Table
CREATE TABLE students (
  student_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_number TEXT,
  home_lat DOUBLE PRECISION,
  home_lng DOUBLE PRECISION,
  registered_home_risk_label TEXT,
  last_known_lat DOUBLE PRECISION,
  last_known_lng DOUBLE PRECISION,
  last_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  last_update_timestamp TIMESTAMPTZ,
  last_update_source TEXT
);

-- Status Logs Table
CREATE TABLE status_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT REFERENCES students(student_id),
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL,
  validation_flag BOOLEAN DEFAULT FALSE
);

-- Evacuation Centers Table
CREATE TABLE evacuation_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

-- System Settings Table (Singleton)
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO system_settings (id, is_active) VALUES (1, FALSE);

-- Admins Table
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT
);

-- Create RPC function for disaster mode toggle
CREATE OR REPLACE FUNCTION toggle_disaster_mode(new_state BOOLEAN)
RETURNS system_settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result system_settings;
BEGIN
  UPDATE system_settings
  SET
    is_active = new_state,
    activated_at = CASE WHEN new_state THEN NOW() ELSE activated_at END
  WHERE id = 1
  RETURNING * INTO result;

  RETURN result;
END;
$$;
```

### 5. Configure Row Level Security (RLS)

Enable RLS on all tables and add appropriate policies in Supabase Dashboard.

### 6. Google OAuth Setup

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Enable **Google** provider
3. Add your OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
4. Set the redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

### 7. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
resq-web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── admin/
│   │   │   └── dashboard/        # Admin dashboard page
│   │   ├── api/                  # API routes
│   │   │   ├── evacuation-centers/
│   │   │   ├── settings/
│   │   │   ├── status-logs/
│   │   │   └── students/
│   │   ├── signin/               # Sign in page
│   │   ├── signup/               # Sign up page
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── AddEvacuationCenterModal.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DisasterModeToggle.tsx
│   │   │   ├── FilterModal.tsx
│   │   │   ├── StudentLog.tsx
│   │   │   ├── StudentMap.tsx
│   │   │   └── StudentTable.tsx
│   │   ├── landing/             # Landing page components
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   └── useDashboard.ts      # Custom React Query hooks
│   ├── lib/
│   │   ├── supabase/            # Supabase client utilities
│   │   ├── api.ts               # API helper functions
│   │   └── utils.ts             # Utility functions
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── public/                       # Static assets
└── package.json
```

## 🎨 Key Components

### AddEvacuationCenterModal

Interactive modal with Leaflet map integration for adding evacuation centers:

- Click-to-select location on map
- Visual marker placement
- Manual coordinate input (latitude/longitude)
- Theme-aware tile layers
- Form validation and API integration

### StudentLog

Real-time status log viewer with:

- Auto-refresh every 30 seconds
- Filter modal integration (source, validation, status)
- Loading states
- Supabase integration

### StudentMap

Interactive map showing:

- Student locations with status-based color coding
- Evacuation center markers
- Bounded area for campus/region
- Cluster support for large datasets

### FilterModal

Centered modal popup for filtering logs:

- Source filter (SMS/APP/ADMIN)
- Validation flag toggle
- Status filter (all statuses)
- Reset and apply actions

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level security policies
- **Service Role Key** - Admin operations use service role for elevated permissions
- **Middleware Authentication** - Protected routes require authentication
- **OAuth Integration** - Secure Google authentication flow
- **Type Safety** - TypeScript ensures type-safe operations

## 📊 Data Models

### Student Status Types

- `SAFE` - Student is confirmed safe
- `NEEDS_ASSISTANCE` - Requires help
- `CRITICAL` - Urgent assistance needed
- `EVACUATED` - Successfully evacuated
- `UNKNOWN` - Status not reported

### Update Sources

- `SMS` - Status updated via SMS
- `APP` - Status updated via mobile app
- `ADMIN` - Manually updated by administrator

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy ResQ Web:

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/resq-web)

### Build for Production

```bash
npm run build
npm start
```

## 📝 Environment Variables Reference

| Variable                        | Description                         | Required |
| ------------------------------- | ----------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL           | ✅ Yes   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public)     | ✅ Yes   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (private) | ✅ Yes   |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and Auth by [Supabase](https://supabase.com/)
- Maps powered by [Leaflet](https://leafletjs.com/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

**ResQ Web** - Keeping students safe during emergencies 🛡️

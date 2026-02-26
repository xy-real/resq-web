# Backend API Implementation

This document describes the complete backend API implementation using Supabase with Row-Level Security (RLS) policies.

## Overview

All API endpoints are integrated with Supabase PostgreSQL database and enforce authentication and authorization through:

- **Row-Level Security (RLS)**: Database-level access control
- **Auth Middleware**: JWT validation for all requests
- **Role-Based Access**: Admin vs Student permissions

## API Endpoints

### Students API

#### `GET /api/students`

Fetch students based on user role:

- **Admin**: Returns all students
- **Student**: Returns only own record
- **Response**: Array of student objects

#### `POST /api/students`

Create a new student record (used during registration).

- **Auth**: Required (authenticated user)
- **Body**:
  ```json
  {
    "student_id": "23-1-12345",
    "name": "John Doe",
    "email": "john@example.com",
    "contact_number": "+639123456789",
    "home_lat": 10.7202,
    "home_lng": 124.7458,
    "registered_home_risk_label": "LOW"
  }
  ```
- **Response**: Created student object

#### `GET /api/students/[id]`

Fetch a specific student by student_id.

- **Auth**: Required
- **RLS**: Students see only own record, admins see all
- **Response**: Student object

#### `PATCH /api/students/[id]`

Update student status or information.

- **Auth**: Required
- **Function Used**: `update_student_status()` for status updates
- **Body**:
  ```json
  {
    "last_status": "SAFE",
    "last_known_lat": 10.7202,
    "last_known_lng": 124.7458,
    "source": "APP"
  }
  ```
- **Response**: Updated student object

#### `DELETE /api/students/[id]`

Delete a student record.

- **Auth**: Admin only
- **Response**: Success message

---

### Status Logs API

#### `GET /api/status-logs`

Fetch status logs with optional filtering.

- **Admin**: See all logs
- **Student**: See only own logs
- **Query Parameters**:
  - `student_id`: Filter by student (admin only)
  - `status`: Filter by status (SAFE, NEEDS_ASSISTANCE, etc.)
  - `source`: Filter by source (APP, SMS, VOICE)
  - `limit`: Limit number of results
- **Response**: Array of status log objects with student info

#### `POST /api/status-logs`

Create a new status log entry.

- **Auth**: Required
- **Body**:
  ```json
  {
    "student_id": "23-1-12345",
    "status": "SAFE",
    "source": "APP",
    "validation_flag": true
  }
  ```
- **Response**: Created log object

---

### Evacuation Centers API

#### `GET /api/evacuation-centers`

Fetch all evacuation centers.

- **Auth**: Required (accessible to all users)
- **Response**: Array of evacuation center objects

#### `POST /api/evacuation-centers`

Create a new evacuation center.

- **Auth**: Admin only
- **Body**:
  ```json
  {
    "center_name": "VSU Main Gymnasium",
    "latitude": 10.7435,
    "longitude": 124.7938
  }
  ```
- **Response**: Created center object

#### `GET /api/evacuation-centers/[id]`

Fetch a specific evacuation center.

- **Auth**: Required
- **Response**: Center object

#### `PATCH /api/evacuation-centers/[id]`

Update an evacuation center.

- **Auth**: Admin only
- **Body**: Fields to update
- **Response**: Updated center object

#### `DELETE /api/evacuation-centers/[id]`

Delete an evacuation center.

- **Auth**: Admin only
- **Response**: Success message

---

### Settings API

#### `GET /api/settings/disaster_mode` or `GET /api/settings/disaster-mode`

Get current disaster mode status.

- **Auth**: Required (accessible to all users)
- **Response**: System settings object
  ```json
  {
    "id": 1,
    "is_active": true,
    "activated_at": "2024-01-15T10:30:00Z"
  }
  ```

#### `PUT /api/settings/disaster_mode` or `PUT /api/settings/disaster-mode`

Toggle disaster mode on/off.

- **Auth**: Admin only
- **Function Used**: `toggle_disaster_mode(p_activate)`
- **Body**:
  ```json
  {
    "is_active": true
  }
  ```
- **Response**: Updated settings object

---

### Dashboard API

#### `GET /api/dashboard/metrics`

Get real-time dashboard metrics.

- **Auth**: Admin only
- **Function Used**: `get_dashboard_metrics()`
- **Response**: Status counts
  ```json
  {
    "total": 1500,
    "safe": 1200,
    "needs_assistance": 150,
    "critical": 50,
    "evacuated": 80,
    "unknown": 20
  }
  ```

---

### Admin API

#### `POST /api/admin/triage`

Manually trigger auto-triage function.

- **Auth**: Admin only
- **Function Used**: `auto_triage_students()`
- **Action**: Marks students as UNKNOWN if no update in 6 hours
- **Response**:
  ```json
  {
    "message": "Auto-triage executed successfully",
    "students_updated": 15
  }
  ```

---

## Database Functions Used

### 1. `update_student_status()`

```sql
update_student_status(
  p_student_id TEXT,
  p_status TEXT,
  p_source TEXT,
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_validation BOOLEAN
)
```

Updates student status and creates corresponding log entry.

### 2. `auto_triage_students()`

```sql
auto_triage_students() RETURNS INTEGER
```

Automatically marks students as UNKNOWN if they haven't updated their status in 6 hours.

### 3. `get_dashboard_metrics()`

```sql
get_dashboard_metrics() RETURNS TABLE(...)
```

Returns aggregated counts of students by status for admin dashboard.

### 4. `toggle_disaster_mode()`

```sql
toggle_disaster_mode(p_activate BOOLEAN)
```

Toggles disaster mode on/off and updates timestamp.

---

## Row-Level Security (RLS) Policies

### Students Table

- **Students**: Can only view/update their own record
- **Admins**: Can view/update all student records
- **Public**: Can insert during registration

### Status Logs Table

- **Students**: Can view only their own logs
- **Admins**: Can view all logs
- **All authenticated users**: Can insert logs

### Evacuation Centers Table

- **All authenticated users**: Can view centers
- **Admins only**: Can insert/update/delete centers

### System Settings Table

- **All authenticated users**: Can view settings
- **Admins only**: Can update settings

### Admins Table

- **Admins only**: Can view admin records

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes**:

- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Authentication Flow

1. User authenticates via `/api/auth` (handled by Supabase Auth)
2. JWT token stored in session cookie
3. Middleware validates token on each request
4. Server-side Supabase client uses service role for RLS enforcement
5. Database enforces row-level policies based on user_id

---

## Security Features

✅ **Row-Level Security**: All data access controlled at database level  
✅ **JWT Validation**: Token-based authentication on all endpoints  
✅ **Role-Based Access**: Admin vs Student permissions enforced  
✅ **Input Validation**: Required fields and type checking  
✅ **SQL Injection Prevention**: Parameterized queries via Supabase client  
✅ **HTTPS Only**: Enforced in production environment

---

## Environment Variables

Ensure these are configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fljbgweerbqmgnnbgkyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Testing the API

### Using cURL

```bash
# Get students (with auth token)
curl -X GET https://your-domain.com/api/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update student status
curl -X PATCH https://your-domain.com/api/students/23-1-12345 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"last_status":"SAFE","source":"APP"}'

# Toggle disaster mode (admin only)
curl -X PUT https://your-domain.com/api/settings/disaster_mode \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_active":true}'
```

### Using Frontend (TanStack Query)

See `src/hooks/useDashboard.ts` for example React Query hooks that consume these endpoints.

---

## Next Steps

1. **Run Database Setup**: Execute `supabase_setup.sql` in your Supabase SQL editor
2. **Test Authentication**: Sign up/sign in to get JWT tokens
3. **Create Admin User**: Manually insert admin record in `admins` table
4. **Test Endpoints**: Use admin dashboard to verify all API routes work
5. **Monitor RLS**: Check Supabase logs to ensure RLS policies are enforced

---

Last Updated: 2024

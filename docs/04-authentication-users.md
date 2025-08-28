# Authentication & User Management

## Overview
The application uses Firebase Authentication (current) with a planned migration to Supabase Auth for the Next.js version. The system provides secure user authentication and role-based access control.

## Authentication Features

### Sign In
**Current Implementation:**
- Email and password authentication
- Firebase Auth integration
- Remember me functionality
- Password visibility toggle
- Form validation
- Error handling with user-friendly messages

**UI Elements:**
- Branded login page with gradient background
- Company logo display
- Email input field
- Password input field with show/hide toggle
- Sign In button
- "Sign Up" link for new users
- Loading states during authentication

**Security Features:**
- Secure password requirements
- Rate limiting for failed attempts
- Session management
- Automatic logout on inactivity

### Sign Up
**Registration Fields:**
- Email address (required, validated)
- Password (required, minimum strength)
- Confirm Password (required, must match)
- Display Name (optional)

**Process Flow:**
1. User fills registration form
2. Email validation
3. Password strength check
4. Account creation
5. Automatic sign in
6. Welcome email (optional)
7. Redirect to home page

### Password Management

**Password Reset:**
- Email-based reset flow
- Secure token generation
- Time-limited reset links
- Confirmation of password change

**Password Change (Logged In):**
- Current password verification
- New password entry
- Confirmation field
- Strength requirements display

## User Profile Management

### Profile Display
**Information Shown:**
- Display Name
- Email Address
- Account creation date
- Last login date
- Role/permissions level

### Profile Editing
**Editable Fields:**
- Display Name
- Profile Photo (future)
- Contact Information (future)
- Preferences

**Non-Editable Fields:**
- Email (requires re-authentication)
- User ID
- Account creation date

## User Roles & Permissions

### Role Types

**Admin:**
- Full system access
- User management
- Configuration management
- Data export/import
- System settings

**Manager:**
- View all data
- Edit all barrel records
- Create/edit production records
- Generate reports
- Manage reference data

**Operator:**
- View assigned areas
- Edit assigned barrels
- Create production records
- View reports

**Viewer (Read-Only):**
- View barrel information
- View production records
- View reports
- No edit capabilities

### Permission Matrix

| Feature | Admin | Manager | Operator | Viewer |
|---------|-------|---------|----------|--------|
| View Barrels | ✅ | ✅ | ✅ | ✅ |
| Edit Barrels | ✅ | ✅ | ✅* | ❌ |
| Delete Barrels | ✅ | ✅ | ❌ | ❌ |
| Add Barrels | ✅ | ✅ | ✅ | ❌ |
| View Production | ✅ | ✅ | ✅ | ✅ |
| Edit Production | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| System Config | ✅ | ✅* | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅* | ❌ |

*Limited to assigned areas or specific functions

## Navigation & UI Components

### Main Navigation
**Authenticated User Menu:**
- Home/Dashboard
- Barrel Management
- Production Tracking
- Reports
- Settings
- Profile
- Sign Out

### Profile Menu (Top Right)
- User Display Name
- Profile link
- Settings link
- Sign Out option

### Home Page Features
- Welcome message with user name
- Quick stats dashboard
- Recent activity
- Quick action buttons

## Session Management

### Security Features
- JWT token-based authentication
- Secure cookie storage
- CSRF protection
- XSS prevention

### Session Behavior
- Auto-refresh tokens
- Remember me option (30 days)
- Explicit logout
- Multi-device support
- Session activity tracking

## Migration to Supabase Auth

### Key Changes Required

**Authentication Provider:**
- Replace Firebase Auth with Supabase Auth
- Implement Supabase client
- Update auth hooks and contexts

**User Data Storage:**
- Move user profiles to Supabase
- Implement Row Level Security (RLS)
- Set up auth triggers

**Features to Implement:**
- Magic link authentication
- OAuth providers (Google, GitHub)
- Multi-factor authentication
- Password policies
- Email verification

### Database Schema for Users

```sql
-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE public.user_preferences (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  default_location TEXT,
  settings JSONB
);

-- Activity log
CREATE TABLE public.user_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Best Practices

### Implementation Requirements
- Secure password hashing (bcrypt/argon2)
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Secure session storage
- HTTPS enforcement
- Content Security Policy headers

### Compliance Considerations
- GDPR compliance for EU users
- Data retention policies
- User data export capability
- Account deletion rights
- Audit trail for sensitive operations

## API Integration

### Authentication Endpoints
- POST /auth/login
- POST /auth/register
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/verify-email

### User Management Endpoints
- GET /users/profile
- PUT /users/profile
- GET /users/preferences
- PUT /users/preferences
- DELETE /users/account

## Testing Requirements

### Unit Tests
- Authentication flow
- Token validation
- Permission checks
- Session management

### Integration Tests
- Login/logout flows
- Password reset process
- Profile updates
- Role-based access

### Security Tests
- SQL injection prevention
- XSS protection
- CSRF token validation
- Rate limiting effectiveness
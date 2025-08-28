# Additional Pages & Features

## Overview
This document covers the remaining pages from the Flutter application that weren't explicitly detailed in other documentation files but are referenced throughout.

## Pages Already Covered in Other Documents

### Fully Documented:
- **barrelDetails.dart** → Covered in `02-barrel-management.md`
- **barrelDetailsEdit.dart** → Covered in `02-barrel-management.md`
- **barrelList.dart** → Covered in `02-barrel-management.md`
- **barrelLocation.dart** → Covered in `02-barrel-management.md`
- **barrelManagement.dart** → Covered in `02-barrel-management.md`
- **barrelScan.dart** → Covered in `02-barrel-management.md`
- **barrelSizes.dart** → Covered in `02-barrel-management.md`
- **barrelTypes.dart** → Covered in `02-barrel-management.md`
- **distillationAdd.dart** → Covered in `03-production-tracking.md`
- **fermentationAdd.dart** → Covered in `03-production-tracking.md`
- **spiritTypes.dart** → Covered in `02-barrel-management.md`
- **statusOptions.dart** → Covered in `02-barrel-management.md`
- **signIn.dart** → Covered in `04-authentication-users.md`
- **profile.dart** → Covered in `04-authentication-users.md`

## Additional Pages Requiring Documentation

### 1. Previous Spirit Types (prevSpiritTypes.dart)
**Purpose:** Manage the list of spirit types that were previously stored in barrels.

**Features:**
- Add new previous spirit types
- View list of all previous spirit types
- Delete unused types
- Sorted alphabetically

**Database Table:** `PrevSpirit`
- `id` (auto-increment)
- `type` (string, unique)

**UI Requirements:**
- Same layout as Spirit Types page
- Input field for new previous spirit type
- Add button
- List view of existing types
- Delete button for each type

**Business Logic:**
- Separate from current spirit types
- Used for tracking barrel history
- Important for flavor profile tracking
- Cannot delete if referenced by barrels

### 2. Sign Up Page (signUp.dart)
**Purpose:** New user registration

**Form Fields:**
- Display Name
- Email Address
- Group Code (organization/distillery code)
- Password
- Confirm Password

**Validation Rules:**
- Email format validation
- Password minimum requirements
- Password confirmation match
- Group code verification (if applicable)

**Process Flow:**
1. Fill registration form
2. Validate all fields
3. Check group code (if multi-tenancy)
4. Create Firebase/Supabase account
5. Create user profile
6. Auto-sign in after success
7. Redirect to home page

**UI Elements:**
- Company logo at top
- Form with all fields
- Password visibility toggle
- Submit button
- Link to Sign In page
- Loading states
- Error messages

### 3. Profile Edit Page (profileEdit.dart)
**Purpose:** Edit user profile information

**Current Features:**
- Display current user name
- Display current email
- Link to change password page
- Account settings section

**Future Enhancements:**
- Edit display name
- Upload profile photo
- Change preferences
- Notification settings
- Theme selection

### 4. Profile Password Change (profilePass.dart)
**Purpose:** Allow users to change their password while logged in

**Form Fields:**
- New Password
- Confirm New Password

**Features:**
- Password strength indicator
- Password visibility toggle
- Validation for matching passwords
- Success confirmation
- Auto-logout after change (optional)

**Security:**
- Requires current session
- May require re-authentication
- Password complexity rules
- Secure update process

### 5. Settings Page (settings.dart)
**Purpose:** Central hub for system configuration

**Menu Items:**
- Add/Remove Spirit Types
- Add/Remove Barrel Types
- Add/Remove Barrel Sizes
- Add/Remove Previous Spirit Types
- Add/Remove Barrel Locations
- Add/Remove Status Options

**UI Layout:**
- List of setting buttons
- Each button navigates to specific configuration page
- Settings icon for each option
- Consistent button styling
- Back navigation

**Access Control:**
- Admin/Manager only
- Some settings may be role-restricted

### 6. Home Page (homePage.dart)
**Purpose:** Main dashboard after login

**Current Features:**
- Welcome message with user name
- Navigation cards to main features:
  - Barrel List
  - Barrel Scan
  - Barrel Management
  - New Fermentation
  - New Distillation
  - Settings
  - Profile
- Animated entrance effects for cards
- Sign out option

**Dashboard Cards Layout:**
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Barrel List    │ │   Barrel Scan   │ │ Barrel Mgmt     │
│  📋 View all    │ │   📷 Quick scan │ │  ➕ Add new     │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Fermentation   │ │  Distillation   │ │   Settings      │
│  🧪 Track batch │ │   🏭 New run    │ │  ⚙️ Configure   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Future Dashboard Enhancements:**
- Quick stats (total barrels, aging, ready)
- Recent activity feed
- Alerts/notifications
- Quick search
- Charts/graphs
- Upcoming maturation dates

## Navigation Flow

### User Journey Map:
```
Sign In/Sign Up
    ↓
Home Page (Dashboard)
    ├── Barrel Management
    │   ├── List View
    │   ├── Details View
    │   ├── Edit/Add
    │   └── QR Scan
    ├── Production
    │   ├── Fermentation
    │   └── Distillation
    ├── Settings
    │   ├── Spirit Types
    │   ├── Barrel Types
    │   ├── Barrel Sizes
    │   ├── Locations
    │   ├── Status Options
    │   └── Previous Spirits
    └── Profile
        ├── View Profile
        ├── Edit Profile
        └── Change Password
```

## Mobile Considerations

### Responsive Behaviors:
- All pages must work on mobile devices
- Touch-optimized controls
- Simplified navigation on small screens
- Swipe gestures where appropriate
- Offline capability for critical features

## Implementation Priority

### Phase 1 (Core):
1. Sign In/Sign Up
2. Home Page
3. Basic Profile

### Phase 2 (Features):
1. All barrel management pages
2. Settings configuration pages

### Phase 3 (Production):
1. Fermentation tracking
2. Distillation tracking

### Phase 4 (Enhanced):
1. Profile editing
2. Password management
3. Previous spirit types
4. Advanced dashboard features

## Data Migration Notes

### From Firebase to Supabase:
- User accounts need migration
- Group codes may need special handling
- Password reset required for all users
- Profile data structure changes
- Navigation routes update

## Testing Requirements

### Critical Paths:
1. New user registration flow
2. Password change flow
3. Settings modifications
4. Navigation between all pages
5. Mobile responsiveness
6. Offline functionality
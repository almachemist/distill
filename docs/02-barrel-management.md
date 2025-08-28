# Barrel Management Features

## Overview
The barrel management system is the core feature of the application, providing comprehensive tracking and management of barrel inventory for distilleries.

## Core Features

### 1. Barrel List View
**Purpose:** Display all barrels in the inventory with filtering and search capabilities.

**Key Functionality:**
- Grid/List view of all barrels
- Search by barrel ID
- Filter by:
  - Spirit type
  - Barrel type
  - Status
  - Location
- Sort by date filled or other criteria
- Quick access to barrel details

**UI Requirements:**
- Responsive table/grid layout
- Search bar with instant filtering
- Filter dropdown menus
- Status badges for visual identification
- Mobile-responsive design

### 2. Barrel Details View
**Purpose:** Display comprehensive information about a specific barrel.

**Information Displayed:**
- **Basic Information:**
  - Barrel ID (prominently displayed)
  - Date Filled
  - Fill Batch Number
  - Volume (in Liters)
  - ABV %
  - Current Spirit Type
  - Barrel Type
  - Previous Spirit Type
  - Estimated Maturation Date

- **Notes Section:**
  - Tasting Notes (multiline text)
  - Other Notes/Comments (multiline text)

- **Other Details Panel:**
  - Current Location
  - Fill Batch Number (duplicate for quick reference)
  - Angel's Share Loss %
  - Last Inspection Date
  - Current Status

**UI Requirements:**
- Clean, card-based layout
- Sections clearly separated
- Edit button for authorized users
- Back navigation to barrel list
- Print-friendly view option

### 3. Barrel Details Edit
**Purpose:** Edit existing barrel information.

**Editable Fields:**
- All fields from Barrel Details view
- Dropdown selections for reference data:
  - Spirit types
  - Barrel types
  - Previous spirit types
  - Locations
  - Status options
- Date pickers for date fields
- Numeric input validation for volumes and percentages

**Features:**
- Pre-populated form with current data
- Validation on required fields
- Save and Cancel buttons
- Confirmation dialog for changes
- Auto-save draft capability

### 4. Barrel Management (Add New)
**Purpose:** Add new barrels to the inventory system.

**Input Fields:**
- **Primary Fields:**
  - Barrel ID (with QR code scanner option)
  - Old Barrel ID (optional, for reassigned barrels)
  - Fill Batch Number
  - Volume
  - ABV %
  
- **Dropdown Selections:**
  - Spirit Type
  - Barrel Type
  - Barrel Size
  - Previous Spirit
  - Location
  - Status

- **Date Fields:**
  - Date Filled (defaults to today)
  - Estimated Maturation Date

- **Additional Fields:**
  - Tasting Notes
  - Angel's Share %
  - Last Inspection Date
  - Notes/Comments

**Features:**
- QR code scanner integration for Barrel ID
- Form validation
- Duplicate ID checking
- Save as draft option
- Bulk import capability

### 5. Barrel QR Scanning
**Purpose:** Quick barrel lookup using QR codes.

**Functionality:**
- Scan QR code using device camera
- Automatic redirect to Barrel Details view
- Support for both 1D barcodes and QR codes
- Error handling for invalid/unknown codes
- Manual entry fallback option

**Technical Requirements:**
- Camera permissions handling
- Fast QR/barcode recognition
- Offline scanning capability
- Batch scanning mode for inventory counts

### 6. Barrel Location Management
**Purpose:** Manage warehouse locations for barrel storage.

**Features:**
- Add new locations
- Edit existing locations
- Delete unused locations
- List all locations with barrel counts
- Location hierarchy support (e.g., Warehouse > Row > Stack)

### 7. Configuration Management

**Spirit Types Management:**
- Add/Edit/Delete spirit types
- Sort alphabetically
- Usage tracking (prevent deletion if in use)

**Previous Spirit Types Management:**
- Separate list from current spirits
- Historical tracking capability

**Barrel Types Management:**
- Add/Edit/Delete barrel types (e.g., Ex-Bourbon, Virgin Oak, Ex-Sherry)
- Description field for each type

**Barrel Sizes Management:**
- Standard sizes (e.g., 200L, 225L, 300L, 500L)
- Custom size options

**Status Options Management:**
- Configurable status list (e.g., Aging, Ready, Emptied, Maintenance)
- Color coding for statuses

## Search & Filter Capabilities

**Search Features:**
- Search by Barrel ID (exact and partial match)
- Search by Batch Number
- Full-text search in notes

**Filter Options:**
- By Spirit Type (multi-select)
- By Status (multi-select)
- By Location (multi-select)
- By Date Range (filled, maturation)
- By ABV Range
- By Volume Range

**Advanced Features:**
- Save filter presets
- Export filtered results
- Bulk operations on filtered results

## Reporting Features

**Required Reports:**
- Inventory Summary by Spirit Type
- Barrels by Location
- Upcoming Maturation Report
- Angel's Share Loss Report
- Status Overview Dashboard

## Mobile Considerations

**Mobile-Specific Features:**
- Simplified navigation
- Touch-optimized controls
- Offline mode with sync
- Camera-based QR scanning
- Swipe gestures for navigation

## Data Validation Rules

**Barrel ID:**
- Unique constraint
- Alphanumeric format
- Minimum 3 characters

**Dates:**
- Date Filled cannot be future date
- Maturation Date must be after Fill Date

**Numeric Fields:**
- ABV: 0-100%
- Volume: Positive numbers only
- Angel's Share: 0-100%

## User Permissions

**View Access:**
- All authenticated users can view barrel information

**Edit Access:**
- Authorized users can edit barrel details
- Admin users can manage configuration tables

**Delete Access:**
- Admin only for barrel deletion
- Soft delete with recovery option
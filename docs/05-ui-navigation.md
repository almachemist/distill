# UI/UX & Navigation Structure

## Overview
The application follows a mobile-first responsive design approach with FlutterFlow theming that needs to be translated to Next.js/React components with modern UI libraries.

## Design System

### Color Palette
**Primary Colors:**
- Primary: Brown/Amber tones (#894128)
- Secondary: Light amber (#EE8B60)
- Background: White/Light gray
- Text: Dark gray/Black

**Status Colors:**
- Success: Green
- Warning: Orange
- Error: Red
- Info: Blue

### Typography
- Display: Plus Jakarta Sans (36px, semi-bold)
- Headlines: System font (22-24px)
- Body: System font (14-16px)
- Labels: System font (12-14px)

### Spacing System
- Base unit: 8px
- Padding: 8, 16, 24, 32px
- Margins: 4, 8, 12, 16, 20, 24px
- Border radius: 8px (standard), 12px (cards), 16px (modals)

## Navigation Structure

### Primary Navigation

**Top Navigation Bar:**
- Logo/Brand (left)
- Page Title (center)
- User Menu (right)
- Mobile hamburger menu

**Main Menu Items:**
1. **Home/Dashboard**
   - Overview stats
   - Quick actions
   - Recent activity

2. **Barrel Management**
   - Barrel List (default)
   - Add New Barrel
   - Barrel Scan
   - Barrel Reports

3. **Production**
   - Fermentation
     - Active Fermentations
     - New Fermentation
     - Fermentation History
   - Distillation
     - Active Distillations
     - New Distillation
     - Distillation History

4. **Configuration**
   - Spirit Types
   - Barrel Types
   - Barrel Sizes
   - Locations
   - Status Options

5. **Reports**
   - Inventory Summary
   - Production Reports
   - Quality Control
   - Export Data

6. **Settings**
   - User Profile
   - System Settings
   - Preferences

### Mobile Navigation
- Hamburger menu for primary navigation
- Bottom tab bar for quick access:
  - Home
  - Barrels
  - Scan
  - Production
  - More

## Page Layouts

### List Pages
**Components:**
- Page header with title
- Search bar
- Filter controls
- Sort options
- Data grid/table
- Pagination
- Action buttons (Add New, Export)

**Features:**
- Responsive table to cards on mobile
- Infinite scroll option
- Bulk actions toolbar
- Quick view on hover/tap

### Detail Pages
**Components:**
- Breadcrumb navigation
- Page title with ID
- Action buttons (Edit, Delete, Print)
- Information cards/sections
- Related data tabs
- Activity timeline

**Layout:**
- Two-column layout on desktop
- Single column on mobile
- Sticky action bar
- Collapsible sections

### Form Pages
**Components:**
- Progress indicator (multi-step)
- Form sections with headers
- Input fields with labels
- Validation messages
- Save/Cancel buttons
- Auto-save indicator

**Features:**
- Inline validation
- Smart defaults
- Conditional fields
- Help tooltips
- Keyboard navigation

## Component Library

### Buttons
**Primary Button:**
- Filled background
- White text
- Hover state
- Loading state
- Disabled state

**Secondary Button:**
- Outlined style
- Primary color border
- Transparent background

**Icon Buttons:**
- Circular or square
- With/without background
- Tooltip on hover

### Form Controls

**Text Input:**
- Label above
- Placeholder text
- Helper text below
- Error state
- Success state
- Character counter

**Select/Dropdown:**
- Searchable options
- Multi-select capability
- Grouped options
- Custom option renderer

**Date Picker:**
- Calendar view
- Quick date selection
- Range selection
- Time picker integration

**Number Input:**
- Increment/decrement buttons
- Min/max validation
- Decimal precision
- Unit labels

### Data Display

**Tables:**
- Fixed headers
- Sortable columns
- Resizable columns
- Row selection
- Expandable rows
- Mobile card view

**Cards:**
- Title section
- Content area
- Action footer
- Status badges
- Hover effects

**Lists:**
- Simple list
- List with avatars
- List with actions
- Grouped lists
- Virtual scrolling

### Feedback Components

**Alerts:**
- Success messages
- Error messages
- Warning messages
- Info messages
- Dismissible option

**Modals:**
- Confirmation dialogs
- Form modals
- Full-screen modals
- Drawer modals
- Loading overlays

**Toasts:**
- Position options
- Auto-dismiss
- Action buttons
- Progress indicators

## Responsive Breakpoints

**Mobile:** < 768px
- Single column layouts
- Bottom navigation
- Collapsed menus
- Touch-optimized controls

**Tablet:** 768px - 1024px
- Two-column layouts
- Side navigation drawer
- Hybrid controls

**Desktop:** > 1024px
- Multi-column layouts
- Full navigation menu
- Hover states
- Keyboard shortcuts

## Accessibility

### Requirements
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility
- High contrast mode support
- Text scaling support

### Implementation
- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- Form label associations
- Error message associations
- Skip navigation links

## Performance Optimization

### Loading States
- Skeleton screens
- Progressive loading
- Lazy loading images
- Virtual scrolling for long lists
- Code splitting by route

### Caching Strategy
- Static asset caching
- API response caching
- Offline capability
- Service worker implementation

## Animation & Transitions

### Page Transitions
- Fade in/out
- Slide animations
- Smooth scrolling
- Parallax effects (minimal)

### Micro-interactions
- Button hover states
- Form field focus
- Loading spinners
- Success checkmarks
- Progress indicators

## Dark Mode Support

### Implementation
- System preference detection
- Manual toggle option
- Persistent user preference
- Smooth transition
- Adjusted color palette

## Recommended Tech Stack

### UI Framework
- **Next.js 15+** with App Router
- **React 18+** for component architecture
- **TypeScript** for type safety

### Component Libraries
- **Shadcn/ui** - Modern, customizable components
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations

### State Management
- **Zustand** or **TanStack Query** - Client state
- **React Hook Form** - Form management

### Additional Tools
- **React Table** - Data tables
- **React Select** - Advanced dropdowns
- **Day.js** - Date manipulation
- **Chart.js** or **Recharts** - Data visualization

## Migration from Flutter

### Key Differences
- Replace FlutterFlow components with React components
- Convert Dart navigation to Next.js routing
- Implement responsive design with CSS/Tailwind
- Replace platform-specific code with web standards
- Update gesture handlers to web events

### Component Mapping
- FlutterFlowTheme → Tailwind config
- FFButtonWidget → Shadcn Button
- FlutterFlowIconButton → Icon Button component
- FlutterFlowDropDown → React Select
- TextFormField → Shadcn Input
- ListView → React virtualized list
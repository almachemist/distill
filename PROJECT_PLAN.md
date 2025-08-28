# Distil - Distillery Management System

## Project Overview

A comprehensive distillery management system built with Next.js 15, TypeScript, and Supabase. The system tracks barrel aging, fermentation, distillation, and provides analytics for distillery operations.

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Hooks, Context API
- **Testing**: Vitest, React Testing Library
- **Package Manager**: pnpm

## Project Structure

```
distil/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/              # Authentication layout
│   │   ├── dashboard/           # Main application
│   │   └── page.tsx            # Landing page
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── components/     # Auth UI components
│   │   │   ├── hooks/          # Auth hooks
│   │   │   └── services/       # Auth services
│   │   ├── barrels/            # Barrel tracking module
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── shared/             # Shared utilities
│   └── lib/                    # Core libraries
│       └── supabase/           # Supabase client
├── supabase/
│   ├── migrations/             # Database migrations
│   └── seed.sql               # Seed data
└── tests/                      # Test files
```

## Module Architecture

Each module follows a consistent structure:
- **Components**: React components specific to the module
- **Services**: Business logic and API calls
- **Hooks**: Custom React hooks
- **Types**: TypeScript type definitions
- **Tests**: Unit and integration tests

## Current Features

### ✅ Completed
1. **Authentication System**
   - User registration with organization creation
   - Login/logout functionality
   - Password reset
   - Session management
   - Row-level security (RLS)

2. **Organization Management**
   - Multi-tenant architecture
   - Organization-scoped data
   - Admin/user role management

3. **Barrel Tracking**
   - Create barrels with auto-generated IDs
   - Track spirit type, barrel type, location
   - Monitor volume and ABV changes
   - Calculate angel's share
   - View/edit barrel details
   - Status management (Aging, Ready, Emptied, etc.)

## Development Roadmap

### Phase 1: Core Barrel Features (Current)
- [ ] **Barrel Sample Recording**
  - Create sample form component
  - Track volume removed, ABV, pH, temperature
  - Tasting notes (color, aroma, taste)
  - Update barrel volume after sampling
  - Service: `BarrelService.addSample()`

- [ ] **Barrel Movement Tracking**
  - Movement form component
  - Track from/to locations
  - Movement history
  - Service: `BarrelService.moveBarrel()`

- [ ] **Barrel History Timeline**
  - Timeline component showing all activities
  - Filter by activity type
  - Export history

### Phase 2: Production Tracking
- [ ] **Fermentation Module**
  - Create fermentation batch
  - Track substrates, water, yeast
  - Record readings (temp, brix, pH, SG) at intervals
  - Calculate alcohol content
  - Link to distillation

- [ ] **Distillation Module**
  - Record distillation runs
  - Track input from fermentation
  - Record yields and cuts
  - Link to barrel filling

### Phase 3: Analytics & Reporting
- [ ] **Dashboard Analytics**
  - Inventory overview charts
  - Aging progress visualization
  - Angel's share trends
  - Production metrics
  - Use Chart.js or Recharts

- [ ] **Export/Reports**
  - PDF generation for compliance
  - CSV exports for analysis
  - TTB reporting formats
  - Inventory reports

### Phase 4: Advanced Features
- [ ] **Batch/Lot Tracking**
  - Connect fermentation → distillation → barrels
  - Full traceability
  - Cost tracking

- [ ] **Inventory Management**
  - Raw materials tracking
  - Finished goods inventory
  - Low stock alerts

- [ ] **Production Scheduling**
  - Calendar view
  - Resource planning
  - Capacity management

## Database Schema

### Key Tables
- `organizations` - Multi-tenant organizations
- `profiles` - User profiles with roles
- `tracking` - Barrel tracking (main table)
- `fermentation` - Fermentation batches
- `distillation` - Distillation runs
- `barrel`, `spirit`, `location`, `status` - Reference data

### Important Notes
- `tracking.id` - UUID primary key for barrels
- `tracking.barrel_number` - Human-readable barrel identifier
- All tables use RLS for multi-tenant security
- Organization-scoped data isolation

## Setup Instructions for New Environment

### Prerequisites
- Node.js 20+ 
- pnpm (`npm install -g pnpm`)
- Docker Desktop (for Supabase local development)
- Git

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/mysticaldiscofrog/distil.git
cd distil
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start Supabase locally**
```bash
# Initialize Supabase (first time only)
pnpm supabase init

# Start Supabase containers
pnpm supabase start
```

This will start:
- PostgreSQL database (port 54322)
- Supabase Studio (http://localhost:54323)
- API Gateway (http://localhost:54321)
- Other Supabase services

4. **Apply database migrations**
```bash
# This will create all tables and apply RLS policies
pnpm supabase db reset
```

5. **Set up environment variables**
```bash
# Copy the example env file
cp .env.local.example .env.local
```

The `.env.local` should contain:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

6. **Start the development server**
```bash
pnpm dev
```

The app will be available at http://localhost:3000

### Database Management

**View database:**
```bash
# Open Supabase Studio
pnpm supabase studio
```

**Reset database (caution: deletes all data):**
```bash
pnpm supabase db reset
```

**Create a new migration:**
```bash
pnpm supabase migration new <migration_name>
```

**Stop Supabase:**
```bash
pnpm supabase stop
```

### Testing

**Run tests:**
```bash
pnpm test          # Run tests once
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage
```

### Common Issues

1. **Port conflicts**: If port 3000 is in use, Next.js will use 3001, 3002, etc.

2. **Supabase not starting**: Make sure Docker Desktop is running

3. **Database connection errors**: Check that Supabase is running with `pnpm supabase status`

4. **RLS errors**: Ensure you're logged in when accessing protected data

## Authentication Flow

1. User signs up → Creates organization → Creates profile
2. User logs in → Session created → Can access organization data
3. All data is scoped to user's organization via RLS

## Development Guidelines

1. **Module Independence**: Each module should be self-contained
2. **Type Safety**: Use TypeScript types for all data structures
3. **Testing**: Write tests for services and complex components
4. **Error Handling**: Always handle errors gracefully with user feedback
5. **Security**: Never bypass RLS, always scope data to organizations

## Production Deployment

For production deployment to Supabase Cloud:
1. Create a project at https://supabase.com
2. Run migrations against production database
3. Update environment variables with production URLs
4. Deploy to Vercel/Netlify/etc.

## Team Contacts

- Repository: https://github.com/mysticaldiscofrog/distil
- Issues: https://github.com/mysticaldiscofrog/distil/issues

## License

Proprietary - All rights reserved
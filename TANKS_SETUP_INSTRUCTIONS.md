# Tank Management System - Setup Instructions

## Overview

The tank management system allows you to monitor and update all production tanks in real-time with:
- Live tank status cards
- Editable product, ABV, volume, status, and notes
- Color-coded status indicators
- Real-time updates across all devices
- Full audit history

## Setup Steps

### 1. Run the Database Migration

Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/dscmknufpfhxjcanzdsr/sql/new

Copy and paste the entire contents of:
`supabase/migrations/20251120130000_create_tanks_system.sql`

Click "Run" to execute the migration.

This will create:
- `tanks` table with all tank data
- `tank_history` table for audit trail
- 10 initial tanks (TK-01 through TK-10)
- Real-time subscriptions
- Row Level Security policies

### 2. Verify Setup

Run the verification script:
```bash
npx tsx scripts/setup-tanks.ts
```

You should see a list of 10 tanks created.

### 3. Access the Tanks Page

Open your browser:
http://localhost:3001/dashboard/production/tanks

You should see all tanks displayed as cards.

## How to Use

### View Tanks
- All tanks are displayed as color-coded cards
- Green = Ready to bottle
- Blue = Proofed down, resting
- Yellow = Settling
- Orange = Waiting to proof down
- Purple = Fresh distillation
- Gray = Empty
- Red = Cleaning or maintenance

### Edit a Tank
1. Click "Edit" on any tank card
2. Update the fields:
   - Product (e.g., "Rainforest Gin")
   - ABV (e.g., 45.0)
   - Volume (e.g., 762)
   - Status (dropdown)
   - Notes (free text)
   - Your Name (for audit trail)
3. Click "Save Changes"

### Real-Time Updates
- Changes appear instantly on all devices
- No page refresh needed
- Perfect for multi-user distillery workflow

## Tank Statuses

- **Empty** - Tank is empty
- **Fresh Distillation** - Just filled with fresh spirit
- **Settling** - Spirit is settling/resting
- **Waiting to Proof Down** - Needs water added to reduce ABV
- **Proofed Down - Resting** - Proofed and resting before bottling
- **Ready to Bottle** - Ready for bottling run
- **Bottled - Tank Empty** - Bottled, tank now empty
- **Cleaning** - Tank is being cleaned
- **Maintenance** - Tank under maintenance

## Initial Tanks

The system creates 10 tanks by default:
- TK-01 to TK-05: 1000L spirits tanks
- TK-06 to TK-07: 500L spirits tanks
- TK-08 to TK-09: 2000L holding tanks
- TK-10: 3000L fermenter

You can modify these in the SQL migration file before running it.

## Files Created

### Database
- `supabase/migrations/20251120130000_create_tanks_system.sql` - Database schema

### Types
- `src/modules/production/types/tank.types.ts` - TypeScript types

### Components
- `src/modules/production/components/TankCard.tsx` - Tank display card
- `src/modules/production/components/TankEditModal.tsx` - Edit modal

### Pages
- `src/app/dashboard/production/tanks/page.tsx` - Main tanks page

### Scripts
- `scripts/setup-tanks.ts` - Verification script

## Troubleshooting

### Tanks table not found
Run the SQL migration in Supabase SQL Editor (step 1 above)

### Changes not saving
Check browser console for errors
Verify you're logged in and have organization access

### Real-time not working
Check that Supabase Realtime is enabled for the `tanks` table in Supabase dashboard

## Next Steps

After setup, you can:
- Add more tanks by inserting into the `tanks` table
- View tank history in the `tank_history` table
- Customize tank types and capacities
- Add tank location/position fields
- Create reports from tank data


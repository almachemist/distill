# Distil - Distillery Management System

A modern distillery management system for tracking barrel aging, fermentation, and distillation processes.

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- Docker Desktop

### Setup

1. **Clone and install:**
```bash
git clone https://github.com/mysticaldiscofrog/distil.git
cd distil
pnpm install
```

2. **Start Supabase (local database):**
```bash
pnpm supabase start
```

3. **Apply database migrations:**
```bash
pnpm supabase db reset
```

4. **Create environment file:**
```bash
cp .env.local.example .env.local
```

5. **Start development server:**
```bash
pnpm dev
```

Visit http://localhost:3000

## Key Commands

```bash
pnpm dev               # Start development server
pnpm build             # Build for production
pnpm test              # Run vitest suite
pnpm lint              # Run ESLint (unused vars fail CI)

# Remote Supabase helpers
pnpm db:push           # Push local migrations to remote Supabase
pnpm db:types          # Regenerate types from remote project
pnpm db:restore        # Seed remote distillation datasets (see below)

# Local sandbox helpers (optional)
pnpm supabase start    # Start local Supabase
pnpm supabase stop     # Stop local Supabase
pnpm supabase studio   # Open database GUI
pnpm supabase db reset # Reset local database (destroys data)
```

## Remote Supabase Usage

We treat the remote Supabase project (`dscmknufpfhxjcanzdsr`) as the source of truth for production data.

### Environment Variables

Duplicate `.env.remote.example` to `.env.local` and populate:

```
NEXT_PUBLIC_SUPABASE_URL=https://dscmknufpfhxjcanzdsr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # Remote publishable key
```

### Database migrations & types

1. Author migrations in `supabase/migrations`.
2. Apply them remotely with `pnpm db:push` (uses Supabase CLI).
3. Regenerate generated types after schema changes via `pnpm db:types` (updates `src/types/supabase.ts`).

### Dataset Seeding

Distillation datasets live under `src/modules/production/new-model/data` and `src/modules/production/data`.

1. Ensure you have Supabase CLI auth (`supabase login`) with access to the remote project.
2. Run `pnpm db:restore` to insert batches into remote tables:
   - `distillation_runs`
   - `rum_production_runs`
   - related inventory tables as required.
3. The script normalizes any `still_used` value of `Roberta` → `Carrie` and reports mismatches.
4. Verify counts via Supabase Studio or:
   ```bash
   pnpm supabase db remote query "select count(*) from distillation_runs"
   ```

### CI Expectations

- `pnpm lint` must pass without unused variables (disable only with justification).
- `pnpm test` must remain green; focus on `lal.service.test.ts` dilution invariance cases when modifying datasets.
- For larger schema changes, create a Supabase branch and validate migrations before merging.

## Project Structure

- `/src/app` - Next.js pages and routing
- `/src/modules` - Feature modules (auth, barrels, etc.)
- `/supabase/migrations` - Database schema
- `/tests` - Test files

## Features

- 🔐 **Authentication** - Secure login with organization support
- 🛢️ **Barrel Tracking** - Monitor aging spirits with volume/ABV tracking
- 📊 **Analytics** - Dashboard with key metrics
- 🏭 **Multi-tenant** - Support multiple distilleries
- 📱 **Responsive** - Works on desktop and mobile

## Tech Stack

- Next.js 15
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- React Testing Library

## Documentation

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed documentation and development roadmap.

## License

Proprietary - All rights reserved

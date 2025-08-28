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
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm supabase start   # Start local Supabase
pnpm supabase stop    # Stop local Supabase
pnpm supabase studio  # Open database GUI
pnpm supabase db reset # Reset database (deletes all data!)
```

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

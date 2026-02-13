# Distil — Comprehensive Development Plan

> **Created**: 13 Feb 2026
> **Goal**: Transform Distil from a single-tenant prototype into a production-ready, multi-tenant SaaS platform for boutique distillery operations management.

---

## Executive Summary

This plan addresses eight workstreams across four phases:

| Phase | Focus | Est. Duration |
|-------|-------|---------------|
| **Phase 0** | Framework Upgrade & Codebase Hygiene | 1–2 weeks |
| **Phase 1** | Multi-Tenant Data Isolation & Auth | 2–3 weeks |
| **Phase 2** | Supabase as Single Source of Truth | 2–3 weeks |
| **Phase 3** | UI/UX Refactor, Testing & SaaS Features | 2–3 weeks |

---

## Phase 0 — Framework Upgrade & Codebase Hygiene

### 0.1 Upgrade Next.js 15 → 16

**Breaking changes to address:**

| Change | Impact on Distil | Action |
|--------|-----------------|--------|
| `middleware.ts` → `proxy.ts` | `src/middleware.ts` must be renamed; export renamed from `middleware()` → `proxy()` | Rename file, rename function, update matcher config key `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize` if used |
| Async Request APIs (sync removed) | `cookies()`, `headers()`, `params`, `searchParams` must be `await`ed everywhere | Audit all Server Components and Route Handlers; apply `await` where missing |
| Turbopack by default | `next-pwa` uses `workbox-webpack-plugin` which conflicts with Turbopack | Disable `next-pwa` webpack wrapper in `next.config.ts` but **keep dependency installed** for future PWA roadmap. Use `--webpack` flag or conditionally bypass during build until PWA is re-enabled with a Turbopack-compatible solution (e.g., `@serwist/next`) |
| `next lint` removed | `pnpm lint` script calls `eslint src` directly — already fine | Remove `eslint` key from `next.config.ts` (no longer supported) |
| ESLint Flat Config | `.eslintrc.json` is legacy format | Migrate to `eslint.config.mjs` flat config (file already exists but needs to be the sole config) |
| React 19.2 | React updated from 19.1.2 → 19.2.x | Update `react`, `react-dom`, `@types/react`, `@types/react-dom` |
| Node.js minimum 20.9.0 | `package.json` says `>=18.17.0` | Update `engines` field to `>=20.9.0` |

**Steps:**
1. Run `npx @next/codemod@canary upgrade latest` for automated migrations
2. Manually rename `middleware.ts` → `proxy.ts`, rename export
3. Remove `next-pwa` and `workbox-webpack-plugin` from dependencies
4. Remove `eslint` config block from `next.config.ts`
5. Remove `.eslintrc.json`, ensure `eslint.config.mjs` is complete
6. Update `engines` in `package.json`
7. Run `pnpm build` — fix any remaining type/compilation errors
8. Smoke test all routes

### 0.2 Codebase Cleanup

**Root directory:**
- Move all root-level status/verification `.md` files into `docs/archive/` (e.g., `FIVE_GIN_RECIPES_VERIFICATION.md`, `GIN_BATCHES_DATA_RECOVERY_COMPLETE.md`, `MIGRATION_COMPLETE.md`, etc.)
- Remove `debug.json`, `fix-missing-gin-batch-data.sql`, `test-barrel-new.js`, `test-barrel.js`, `test-signup.js`, `test-supabase.mjs`, `Gin Run Log - Oaks Kitchen (version 1).xlsb.xlsx`
- Remove `current_schema.sql` (can be regenerated with `supabase db dump`)
- Remove `temp/` directory

**Scripts directory:**
- Delete all 0-byte empty stub files (≈12 files)
- Delete `.backup` files (e.g., `DynamicProductionForm.tsx.backup`)
- Move one-off migration/import scripts to `scripts/archive/`
- Keep only actively used scripts at top level
- Remove commented-out "OLD CODE" blocks from source files (e.g., `production/page.tsx`)

**Dependencies:**
- Remove `next-pwa` and `workbox-webpack-plugin`
- Remove `@supabase/auth-helpers-nextjs` (superseded by `@supabase/ssr` already in use)
- Remove `firebase-stubs.d.ts` type file (legacy artifact)

---

## Phase 1 — Multi-Tenant Data Isolation & Authentication

### 1.1 Organization & Subscription Schema

**Extend `organizations` table:**

```sql
ALTER TABLE public.organizations
  ADD COLUMN slug TEXT UNIQUE,               -- URL-friendly identifier
  ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN trial_ends_at TIMESTAMPTZ,
  ADD COLUMN max_users INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN max_barrels INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN max_batches_per_month INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN logo_url TEXT,
  ADD COLUMN timezone TEXT DEFAULT 'Australia/Brisbane',
  ADD COLUMN currency TEXT DEFAULT 'AUD';
```

**Create `user_organizations` junction table** (supports future multi-org users):

```sql
CREATE TABLE public.user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator'
    CHECK (role IN ('owner', 'admin', 'manager', 'operator', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
```

> **Note:** The tanks migration already references `user_organizations` in its RLS policies. This table must be created first to make those policies functional.

**Update `profiles` table:**
- Keep `organization_id` for default/active org (backward compat)
- Add `onboarding_completed BOOLEAN DEFAULT false`

### 1.2 Fix Unique Constraints for Multi-Tenancy

The following tables have `UNIQUE` constraints on name/type columns that prevent multiple organizations from using the same values. These must become **composite unique constraints**:

| Table | Current Constraint | New Constraint |
|-------|-------------------|----------------|
| `barrel` | `UNIQUE(type)` | `UNIQUE(organization_id, type)` |
| `barrel_size` | `UNIQUE(size)` | `UNIQUE(organization_id, size)` |
| `location` | `UNIQUE(location)` | `UNIQUE(organization_id, location)` |
| `spirit` | `UNIQUE(type)` | `UNIQUE(organization_id, type)` |
| `prev_spirit` | `UNIQUE(type)` | `UNIQUE(organization_id, type)` |
| `status` | `UNIQUE(status)` | `UNIQUE(organization_id, status)` |

### 1.3 Add `organization_id` to Tables Missing It

These tables were created without `organization_id` and have **no tenant isolation**:

| Table | Current RLS | Action |
|-------|-------------|--------|
| `distillation_runs` | `USING (true)` — wide open | Add `organization_id UUID NOT NULL REFERENCES organizations(id)`, rewrite RLS |
| `production_batches` | Public SELECT, authenticated INSERT/UPDATE | Add `organization_id UUID NOT NULL REFERENCES organizations(id)`, rewrite RLS |
| `recipes` | No RLS policies at all | Add `organization_id UUID NOT NULL REFERENCES organizations(id)`, add RLS |
| `rum_production_runs` | Needs audit | Add `organization_id` if missing, add proper RLS |
| `old_roberta_batches` | Needs audit | Add `organization_id` if missing, add proper RLS |

### 1.4 Standardize RLS Policies

Currently there are **three different RLS patterns** in use:
1. **Original tables** — check `profiles.organization_id` via subquery (good but verbose)
2. **Newer tables (batch_materials, etc.)** — only check `auth.uid() IS NOT NULL` (❌ no org scoping)
3. **Tanks** — reference `user_organizations` table (✅ correct for multi-org)

**Standardize all tables to use a helper function:**

```sql
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.user_organizations
  WHERE user_id = auth.uid() AND is_active = true;
$$;
```

Then every RLS SELECT policy becomes:
```sql
CREATE POLICY "org_isolation_select" ON public.<table>
  FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));
```

This is consistent, performant (one function), and supports multi-org membership.

### 1.5 Authentication — Remove Dev Mocks, Implement Real Flow

**Remove:**
- Dev mock user in `useAuth.tsx` (lines 59–71, 100–111, 124–136)
- `process.env.NODE_ENV !== 'development'` bypass in `proxy.ts` (formerly middleware)
- Mock organization from migration `20250905202028`

**Implement:**
1. **Signup flow**: Email/password → create `auth.user` → trigger creates `profile` → create `organization` → create `user_organizations` row (role: `owner`) → redirect to onboarding
2. **Login flow**: Email/password → verify session → load profile + active org → redirect to dashboard
3. **Invite flow**: Admin enters email → create `user_organizations` row (pending) → send invite email via Supabase auth → user signs up → link to org
4. **Password reset**: Already scaffolded, verify it works end-to-end
5. **Session refresh**: Already implemented in `useAuth`, verify with real tokens
6. **Org switching**: If user belongs to multiple orgs, provide a switcher in the nav

**Dev environment seeding** (replaces mock user):
- Create `supabase/seed.sql` that inserts a test org + test user with known credentials
- Document dev login credentials in README
- Use `supabase db reset` to get a clean local environment with seed data

### 1.6 Org-Scoped API Routes

Every API route handler must:
1. Extract the authenticated user from the Supabase session
2. Resolve their `organization_id` from `user_organizations`
3. Pass `organization_id` as a filter to all queries
4. Return 401 if no valid session, 403 if org access denied

Create a shared utility:

```typescript
// src/lib/api-auth.ts
export async function getOrgContext(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new ApiError(401, 'Unauthorized')

  const { data: membership } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!membership) throw new ApiError(403, 'No organization access')

  return { user, organizationId: membership.organization_id, role: membership.role }
}
```

---

## Phase 2 — Supabase as Single Source of Truth

### 2.1 Audit & Migrate Static Data → Supabase

| Static Source | Records | Target Table | Action |
|--------------|---------|-------------|--------|
| `production/data/rum-batches.dataset.ts` (164 KB) | ~50+ rum batches | `rum_production_runs` | Write migration script to transform & insert |
| `production/data/rainforest.json` (153 KB) | Gin batches | `distillation_runs` | Write migration script |
| `production/data/Navy.json` (80 KB) | Navy gin batches | `distillation_runs` | Write migration script |
| `production/data/old_cane_spirit.json` (90 KB) | Cane spirit batches | `distillation_runs` or new table | Write migration script |
| `production/data/old_rum.json` (39 KB) | Old rum batches | `rum_production_runs` | Write migration script |
| `production/data/dryseason.json`, `wetseason.json`, `signature-gin-batches.json` | Gin variants | `distillation_runs` | Write migration scripts |
| `production/data/production_batches.json` | Mixed batches | `production_batches` | Already has a table — migrate with `organization_id` |
| `production/sessions/*.session.ts` (16 files) | Example sessions | `distillation_runs` | Migrate or keep as seed data |
| `data/sales_analytics_2025.json` (253 KB) | Sales data | New `sales` or `orders` table | Design table, migrate |
| `data/crm_analytics_2025.json` (391 KB) | CRM data | New `customers`/`crm_events` tables | Design tables, migrate |
| `data/production_calendar_2026*.json` | Calendar entries | `calendar_events` | Migrate to existing table |
| `data/tank_inventory.json` | Tank state | `tanks` | Already has a table — verify data matches |
| `data/stock_take_2025-11-13.json` | Stock snapshot | `items` / `inventory_movements` | Migrate as inventory adjustment |
| `production/data/packaging-items.data.ts` | Packaging catalog | `items` | Migrate |

### 2.2 Remove Fallback Service Pattern

After data is migrated:

1. **Delete** `batch-fallback.service.ts` (50 KB) — replace all call sites with Supabase queries via repository classes
2. **Delete** `useDashboardStats.ts` direct JSON import of `sales_analytics_2025.json` — replace with API call to Supabase
3. **Delete** static imports of session files from `dashboard/page.tsx` — fetch recent sessions from Supabase
4. **Delete** hardcoded dashboard data (tasks list, etc.) — fetch from Supabase or make them user-configurable

### 2.3 Repository Layer Standardization

Every module should follow this pattern:

```
src/modules/{feature}/
  services/
    {feature}.repository.ts    ← Supabase queries (single source)
    {feature}.service.ts       ← Business logic (calculations, validation)
  hooks/
    use{Feature}.ts            ← React Query hook wrapping the repository
  types/
    {feature}.types.ts         ← TypeScript interfaces
```

**Adopt React Query consistently:**

```typescript
// Example: src/modules/production/hooks/useDistillationRuns.ts
export function useDistillationRuns() {
  return useQuery({
    queryKey: ['distillation-runs'],
    queryFn: () => distillationRunRepository.fetchAll(),
  })
}
```

**Wire up React Query provider** in root layout (it's installed but not initialized).

### 2.4 Regenerate TypeScript Types

After all schema changes:

```bash
pnpm db:types
```

This regenerates `src/types/supabase.ts` to reflect all new columns, tables, and constraints. All repository classes should use these generated types for compile-time safety.

---

## Phase 3 — UI/UX Refactor, Testing & SaaS Features

### 3.1 Decompose Giant Components

| Component | Current Size | Decomposition Plan |
|-----------|-------------|-------------------|
| `DynamicProductionForm.tsx` | 53 KB / 1,017 lines | Split into: `RunDetailsSection`, `ChargeAdjustmentSection`, `StillSetupSection`, `CollectionPhasesSection`, `DilutionSection`, `FinalProductSection` + parent orchestrator |
| `BatchDetailView.tsx` | 59 KB / 1,148 lines | Split into: `BatchHeader`, `PhaseTimeline`, `BatchStats`, `BatchOutputTable`, `BatchEditForm` |
| `LiveDistillationTracker.tsx` | 50 KB | Split into: `TrackerHeader`, `PhaseProgress`, `ReadingsPanel`, `OutputPanel`, `TrackerControls` |
| `batch-fallback.service.ts` | 50 KB / 1,105 lines | Eliminated entirely (Phase 2) |

### 3.2 Design System Enforcement

**Move palette to Tailwind config** (`tailwind.config.ts` or CSS `@theme`):

```css
@theme {
  --color-copper: #B87333;
  --color-graphite: #2E2E2E;
  --color-onyx: #0A0A0A;
  --color-beige: #E9E4D8;
  --color-copper-red: #D86D5A;
  --color-copper-amber: #E3B24C;
  --color-copper-green: #7AB97A;
  --color-brand: #894128;
}
```

Then replace all hardcoded hex values (`text-[#1A1A1A]`, `bg-amber-50`, `text-neutral-600`, etc.) with theme tokens (`text-graphite`, `bg-beige`, etc.).

**Expand `src/components/ui/`** — currently only 4 files (`badge`, `card`, `table`, `tabs`). Add:
- `Button.tsx` (variants: primary/copper, secondary, ghost, destructive)
- `Input.tsx`, `Select.tsx`, `Textarea.tsx`
- `Modal.tsx` / `Dialog.tsx`
- `Spinner.tsx`
- `Alert.tsx`
- `Badge.tsx` (expand existing)

### 3.3 Testing Strategy

**Tier 1 — Critical path (implement first):**
- Auth flow: signup, login, logout, session refresh, org creation
- RLS isolation: verify Tenant A cannot see Tenant B data
- Production batch CRUD: create, read, update distillation runs
- Recipe CRUD and batch-from-recipe flow
- Inventory movement calculations

**Tier 2 — Business logic:**
- LAL calculations (`lal.service.test.ts` already exists — expand)
- Distillation cost calculations
- Dilution calculations
- Batch numbering / ID generation
- Dashboard stats aggregation

**Tier 3 — UI components:**
- Form validation (Zod schemas)
- Navigation and routing
- Component rendering with different data states

**Target:** ≥70% coverage on services/repositories, ≥50% on hooks, key component smoke tests.

### 3.4 SaaS Onboarding & Subscription

**Onboarding wizard** (after signup):
1. Organization name, timezone, currency
2. Equipment setup (stills, tanks, locations)
3. Seed reference data (spirit types, barrel types, statuses)
4. Optional: import existing data from CSV/Excel

**Stripe integration:**
- Create products/prices for subscription tiers
- Checkout session for upgrade
- Webhook handler for `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
- Enforce tier limits (max users, barrels, batches) via server-side checks

**Tier structure (suggested):**

| Feature | Free | Starter | Professional |
|---------|------|---------|-------------|
| Users | 1 | 3 | 10 |
| Barrels | 10 | 50 | Unlimited |
| Batches/month | 5 | 20 | Unlimited |
| Recipes | 3 | 15 | Unlimited |
| CRM/Sales | ❌ | ❌ | ✅ |
| Export/Reports | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ |

### 3.5 Nav & Responsive Improvements

**Current nav** is a horizontal link bar with 10 items — overflows on smaller screens, no mobile menu, no active-state indicator.

**Improve to:**
- Collapsible sidebar (desktop) with icon + label
- Hamburger menu (mobile)
- Active route highlighting
- Role-based nav items (hide admin pages from operators)
- Org name/logo in header

---

## Implementation Order (Recommended)

```
Week 1-2:  Phase 0 — Next.js 16 upgrade + cleanup
Week 3-4:  Phase 1.1–1.4 — Schema changes, org table, RLS standardization
Week 5:    Phase 1.5–1.6 — Auth implementation, API route scoping
Week 6-7:  Phase 2.1–2.2 — Data migration to Supabase, remove fallbacks
Week 8:    Phase 2.3–2.4 — Repository standardization, React Query, type regen
Week 9:    Phase 3.1 — Component decomposition
Week 10:   Phase 3.2–3.3 — Design system + testing
Week 11+:  Phase 3.4–3.5 — Stripe integration, onboarding, nav overhaul
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Data loss during JSON → Supabase migration | Write idempotent scripts with dry-run mode; backup existing Supabase data first |
| Breaking existing functionality during Next.js 16 upgrade | Run codemod first; keep a `pre-upgrade` git branch; test every route |
| RLS policy changes lock users out | Test locally with `supabase db reset` + seed; verify with multiple test users |
| `next-pwa` removal breaks offline expectations | PWA is already disabled (`disable: true`); no user impact |
| Large component refactors introduce regressions | Write smoke tests BEFORE decomposing; use feature flags if needed |

---

## Definition of Done (per phase)

- [ ] **Phase 0**: `pnpm build` succeeds on Next.js 16, zero ESLint errors, root directory clean
- [ ] **Phase 1**: All tables have `organization_id` + org-scoped RLS, real auth works end-to-end, signup creates org
- [ ] **Phase 2**: Zero static JSON imports in production code, all data served from Supabase, React Query wired up
- [ ] **Phase 3**: No component >400 lines, ≥70% service test coverage, Stripe subscription flow works, responsive nav

---

## Files to Create/Modify Summary

### New files:
- `src/lib/api-auth.ts` — shared org-context extractor for API routes
- `src/lib/query-provider.tsx` — React Query provider wrapper
- `src/modules/{feature}/hooks/use*.ts` — React Query hooks per feature
- `supabase/migrations/2026XXXX_*.sql` — new migrations for schema changes
- `scripts/migrate-json-to-supabase.ts` — consolidated data migration script

### Major modifications:
- `src/proxy.ts` (renamed from `middleware.ts`)
- `next.config.ts` — remove eslint block, remove PWA wrapper
- `package.json` — updated deps, engines, scripts
- `src/app/layout.tsx` — add QueryProvider, remove PWA scripts
- `src/modules/auth/hooks/useAuth.tsx` — remove all dev mocks
- `src/app/dashboard/page.tsx` — fetch from Supabase, not static data
- `src/app/dashboard/layout.tsx` — responsive nav, org context
- All API route handlers — add org scoping
- All RLS policies — standardize to `user_org_ids()` pattern

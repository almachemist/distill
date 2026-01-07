# Deploying to Vercel

## Environment Variables

Set these in the Vercel Project Settings → Environment Variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_BARRELS_TABLE (optional, defaults to tracking)
- NEXT_PUBLIC_BARRELS_TABLE (optional, defaults to tracking)

Do not expose service role keys in client-visible variables. Keep SUPABASE_SERVICE_ROLE_KEY server-only.

## Runtime

- API routes that access Supabase with the service role run on Node.js:
  - src/app/api/barrels/route.ts
  - src/app/api/debug/supabase/route.ts

These routes already set:
- export const runtime = 'nodejs'
- export const dynamic = 'force-dynamic'

## Caching

- Client fetches use cache: 'no-store' to avoid stale data.
- Pages that render dynamic Supabase data export dynamic = 'force-dynamic'.

## Tailwind and Styles

- Tailwind v4 is enabled via postcss.config.mjs with "@tailwindcss/postcss".
- Custom brand utility classes are defined in src/app/globals.css.

## Build

Vercel will use:
- Install: auto
- Build: next build
- Output: Next.js (App Router)

## Common Pitfalls

- Missing environment variables:
  - /api/debug/supabase returns a helpful JSON error if SUPABASE_SERVICE_ROLE_KEY is not set.
  - Client-side Supabase falls back to a safe stub if NEXT_PUBLIC_ keys are missing.

- RLS restrictions:
  - Server-side endpoints use the service role for admin reads.
  - Client-side queries rely on the logged-in user and RLS.

## Verification

- Hit https://<your-vercel-domain>/api/debug/supabase to confirm envs and tracking count.
- Visit /dashboard/barrels to confirm all barrels render and filters work.


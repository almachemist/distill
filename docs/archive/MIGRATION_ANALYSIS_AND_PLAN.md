# Distil - Data Migration Analysis & Plan
## Senior Developer Handover Document - UPDATED

**Date:** November 7, 2025
**Project:** Distil - Distillery Management System
**Current State:** Local development with static JSON data + Partial remote migration
**Target State:** Complete remote Supabase migration with all production data

---

## 📊 CURRENT STATE ANALYSIS

### Application Architecture
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL) - Currently using LOCAL instance
- **Authentication:** Supabase Auth with Row-Level Security (RLS)
- **State Management:** React Hooks, Zustand
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm

### Current Environment Configuration
**Local Development (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ Remote Supabase Project (CONFIRMED):**
- Project ID: `dscmknufpfhxjcanzdsr` ✅ **FOUND AND ACTIVE**
- Name: `distil`
- Region: `ap-southeast-2` (Sydney)
- Status: `ACTIVE_HEALTHY`
- Database Version: PostgreSQL 17.6.1
- Created: November 5, 2025
- URL: `https://dscmknufpfhxjcanzdsr.supabase.co`

---

## 📁 STATIC DATA INVENTORY

### Production Data Files (JSON)

#### 1. **Rum Production Data**
- **Location:** `src/app/rum/rum_production_data.json`
- **Records:** ~100+ rum batches (RUM-23-1 through RUM-24-7+)
- **Structure:** Fermentation tracking, distillation logs, temperature profiles
- **Target Table:** `rum_production_runs`

#### 2. **Gin Production Batches**
- **Signature Dry Gin:**
  - `scripts/data/batches/signature-dry-gin-0001.json` through `signature-dry-gin-0020.json`
  - 20 individual batch files
  - Consolidated backup: `scripts/backups/signature-dry-gin-full-history-2025-11-07.json`
  
- **Rainforest Gin:**
  - `scripts/rainforest-gin-data.json`
  - Backup: `scripts/backups/rainforest-gin-backup-2025-11-07.json`
  - Contains RF-28 and RF-29 batches

- **Other Gin Batches:**
  - `src/modules/production/data/signature-gin-batches.json`
  - `supabase/exports/gin-batches.json`

- **Target Table:** `distillation_runs` or `production_batches`

#### 3. **General Production Batches**
- **Location:** `src/modules/production/data/production_batches.json`
- **Records:** Mixed batches (RUM-24-*, GIN-*, VODKA-*, CS-* cane spirit)
- **Structure:** Fermentation, distillation, output tracking
- **Target Table:** `production_batches`

#### 4. **Business Data**
- **Pricing Catalogue:** `data/pricing_catalogue_2025.json`
  - Product pricing, wholesale/RRP, volumes, ABV
  - Categories: Limited Release, Core Range, Mini Bar, House Pour, Traveler
  - **Target Table:** `pricing_catalogue` or `products`

- **Sales Summary:** `data/sales_summary_2025.json`
  - Sales data by product, SKU, revenue, refunds
  - Categories: Uncategorized, Cellar Door
  - **Target Table:** `sales_summary` or `sales_transactions`

#### 5. **TypeScript Data Files**
- `src/modules/production/data/rum-batches.dataset.ts`
- `src/modules/production/data/distillation-sessions.data.ts`
- `src/modules/production/data/fy2025-distillation-log.data.ts`
- `src/modules/production/data/packaging-items.data.ts`

---

## 🗄️ DATABASE SCHEMA ANALYSIS

### Existing Migrations (18 total)
1. `20250828013505_initial_schema.sql` - Core tables (organizations, profiles, barrels, etc.)
2. `20250828014040_rls_policies.sql` - Row Level Security
3. `20250828224657_add_inventory_and_recipes_system.sql` - Items, lots, recipes
4. `20251031014000_create_pricing_and_sales_tables.sql` - Pricing & sales
5. `20251103120000_create_distillation_runs.sql` - Distillation tracking
6. `20251103130000_create_rum_production_runs.sql` - Rum production
7. `20251107000000_create_production_batches.sql` - Production batches
8. `20251107150000_create_import_gin_batch_function.sql` - Import function

### Key Tables for Migration

#### Production Tables
- `production_batches` - General production tracking
- `distillation_runs` - Gin/vodka distillation sessions
- `rum_production_runs` - Rum-specific production
- `calendar_events` - Production scheduling

#### Inventory & Recipes
- `items` - Raw materials, botanicals, chemicals
- `lots` - Inventory lots with tracking
- `inventory_txns` - Inventory transactions
- `recipes` - Product recipes
- `recipe_ingredients` - Recipe components

#### Business Data
- `pricing_catalogue` - Product pricing (if exists)
- `sales_summary` - Sales data (if exists)

#### Reference Data
- `organizations` - Multi-tenancy
- `profiles` - User profiles
- `spirit`, `prev_spirit`, `barrel`, `barrel_size`, `location`, `status`

---

## 🚨 CRITICAL FINDINGS

### 1. ✅ **Remote Supabase Project - CONFIRMED**
- Project `dscmknufpfhxjcanzdsr` EXISTS and is ACTIVE
- All schema migrations successfully applied
- Database is ready for data migration
- **Status:** Ready to proceed

### 2. ⚠️ **Partial Migration Already Started**
- 10 rum batches already migrated (out of ~100)
- 8 production batches already in database
- Previous developer started migration but didn't complete it
- **Risk:** Potential duplicates if we re-import
- **Action Required:** Need upsert strategy to handle existing data

### 3. ⚠️ **Data Duplication & Inconsistencies**
- Multiple copies of same data in different locations
- Backups vs. source files unclear
- Some batches in `distillation_runs` table, others in `production_batches`
- Different structures for similar data (gin batches)
- **Action Required:** Identify canonical source for each dataset

### 4. ✅ **Schema Completeness - VERIFIED**
- All 32 tables exist in remote database
- Pricing and sales tables confirmed present
- Complex schemas ready (rum_production_runs has 90+ columns)
- JSONB fields available for flexible data storage

### 5. ⚠️ **Data Format Inconsistencies**
- Some data in JSON, some in TypeScript
- Different structures for similar data (gin batches)
- Need normalization strategy
- **Action Required:** Map JSON structures to database schemas

---

## 📋 MIGRATION PLAN

### Phase 1: Environment Setup & Verification (Day 1)

#### Step 1.1: Confirm Remote Supabase Project
- [ ] Verify correct project: `qjivqslavzczcjbwjkua` or create new
- [ ] Obtain remote credentials:
  - Project URL
  - Anon Key (public)
  - Service Role Key (private - for migrations)

#### Step 1.2: Update Environment Configuration
- [ ] Create `.env.remote` file with remote credentials
- [ ] Update `.env.local` to point to remote (or keep separate)
- [ ] Test connection to remote database

#### Step 1.3: Verify Remote Schema
- [ ] Apply all migrations to remote: `pnpm db:push`
- [ ] Verify all 18 migrations applied successfully
- [ ] Generate TypeScript types: `pnpm db:types`
- [ ] Check for missing tables or columns

### Phase 2: Data Audit & Preparation (Day 1-2)

#### Step 2.1: Inventory All Data
- [ ] Create comprehensive list of all JSON/TS data files
- [ ] Count total records per dataset
- [ ] Identify duplicates and conflicts
- [ ] Document data relationships

#### Step 2.2: Data Validation
- [ ] Validate JSON structure for each file
- [ ] Check for data integrity issues
- [ ] Identify missing required fields
- [ ] Document data quality issues

#### Step 2.3: Create Backup Strategy
- [ ] Export current local database state
- [ ] Backup all JSON files (already in `scripts/backups/`)
- [ ] Create rollback plan
- [ ] Document backup locations

### Phase 3: Migration Script Development (Day 2-3)

#### Step 3.1: Consolidate Existing Scripts
Review and update existing import scripts:
- `scripts/import-to-supabase.ts`
- `scripts/import-signature-dry-gin-data.ts`
- `scripts/import-rainforest-gin-data.ts`
- `scripts/import-all-signature-batches.ts`
- `scripts/import-gin-batches/secure-import.js`

#### Step 3.2: Create Master Migration Script
Build comprehensive migration script that:
- Connects to remote Supabase
- Validates schema before import
- Imports data in correct order (respecting foreign keys)
- Handles duplicates (upsert strategy)
- Logs progress and errors
- Provides rollback capability

#### Step 3.3: Data Transformation
- Normalize data structures
- Handle TypeScript to JSON conversion
- Map fields to database schema
- Generate UUIDs where needed
- Set organization_id for multi-tenancy

### Phase 4: Test Migration (Day 3-4)

#### Step 4.1: Dry Run
- [ ] Test migration on local database first
- [ ] Verify data integrity
- [ ] Check foreign key relationships
- [ ] Validate data counts

#### Step 4.2: Staging Migration
- [ ] Create test organization in remote database
- [ ] Import subset of data (10% sample)
- [ ] Verify through Supabase Studio
- [ ] Test application functionality with migrated data

### Phase 5: Production Migration (Day 4-5)

#### Step 5.1: Pre-Migration
- [ ] Final backup of all data
- [ ] Notify stakeholders
- [ ] Schedule maintenance window
- [ ] Prepare rollback procedure

#### Step 5.2: Execute Migration
- [ ] Run migration scripts in order:
  1. Reference data (spirit types, locations, etc.)
  2. Rum production data
  3. Gin production data (Signature, Rainforest, others)
  4. General production batches
  5. Pricing catalogue
  6. Sales summary
  7. Inventory items and lots
  8. Recipes and ingredients

#### Step 5.3: Verification
- [ ] Verify record counts match source
- [ ] Check data integrity constraints
- [ ] Test application functionality
- [ ] Verify RLS policies work correctly

### Phase 6: Application Update (Day 5)

#### Step 6.1: Update Application Code
- [ ] Remove static JSON imports
- [ ] Update data fetching to use Supabase queries
- [ ] Test all CRUD operations
- [ ] Update any hardcoded data references

#### Step 6.2: Testing
- [ ] Test authentication flow
- [ ] Test data retrieval
- [ ] Test data creation/updates
- [ ] Test multi-user scenarios

---

## 🔑 WHAT I NEED FROM YOU

### 1. **Remote Supabase Credentials**
Please provide for project `qjivqslavzczcjbwjkua` (or confirm different project):

```
NEXT_PUBLIC_SUPABASE_URL=https://qjivqslavzczcjbwjkua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**How to get these:**
1. Go to https://supabase.com/dashboard
2. Select the "distil" project
3. Go to Settings → API
4. Copy the Project URL, anon/public key, and service_role key

### 2. **Clarifications**
- Confirm the remote project to use (qjivqslavzczcjbwjkua or different?)
- Are there any existing users/data in remote database we need to preserve?
- What is the priority order for data migration?
- Any specific data that should NOT be migrated?

### 3. **Access Verification**
- Confirm you have admin access to the Supabase project
- Verify you can access Supabase Studio for the remote project
- Confirm you have Supabase CLI installed and authenticated

---

## 📊 DATA MIGRATION SUMMARY

| Dataset | Source File(s) | Record Count (Est.) | Target Table | Priority |
|---------|---------------|---------------------|--------------|----------|
| Rum Production | `src/app/rum/rum_production_data.json` | ~100 | `rum_production_runs` | HIGH |
| Signature Gin | `scripts/data/batches/signature-dry-gin-*.json` | 20 | `distillation_runs` | HIGH |
| Rainforest Gin | `scripts/rainforest-gin-data.json` | 2 | `distillation_runs` | HIGH |
| Production Batches | `src/modules/production/data/production_batches.json` | ~50 | `production_batches` | HIGH |
| Pricing Catalogue | `data/pricing_catalogue_2025.json` | ~30 | TBD | MEDIUM |
| Sales Summary | `data/sales_summary_2025.json` | ~100 | TBD | MEDIUM |
| Packaging Items | `src/modules/production/data/packaging-items.data.ts` | ~20 | `items` | LOW |

**Total Estimated Records:** ~300-400 production records + business data

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Multiple backups, dry run, staged approach |
| Schema mismatch | HIGH | Verify schema before migration, test locally |
| Application downtime | MEDIUM | Migrate during low-usage period, keep local fallback |
| Data duplication | MEDIUM | Use upsert with unique constraints |
| RLS policy issues | MEDIUM | Test with multiple user roles |
| Foreign key violations | HIGH | Import in dependency order, validate relationships |

---

## 🎯 SUCCESS CRITERIA

- [ ] All static JSON data successfully migrated to remote Supabase
- [ ] Zero data loss (all records accounted for)
- [ ] Application functions correctly with remote database
- [ ] No breaking changes to existing functionality
- [ ] RLS policies working correctly
- [ ] Performance acceptable (queries < 200ms)
- [ ] Local development still works (can switch between local/remote)
- [ ] Documentation updated with new data flow

---

## 📝 NEXT STEPS

Once you provide the remote Supabase credentials, I will:

1. ✅ Connect to remote database and verify schema
2. ✅ Create comprehensive migration scripts
3. ✅ Perform dry run on local database
4. ✅ Execute staged migration to remote
5. ✅ Verify data integrity
6. ✅ Update application to use remote database
7. ✅ Test all functionality
8. ✅ Document the new architecture

**Estimated Timeline:** 3-5 days for complete migration and testing

---

## 📞 QUESTIONS?

Please provide the credentials and clarifications above, and I'll proceed with the migration plan immediately.


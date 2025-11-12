# ✅ Quick Start Checklist - Complete the Migration

## 🎯 Goal
Complete the migration of all static JSON data to remote Supabase database.

---

## 📋 What You Need to Provide

### 1. Supabase Credentials (5 minutes)

Go to: https://supabase.com/dashboard

1. Select project: **"distil"** (ID: dscmknufpfhxjcanzdsr)
2. Click **Settings** → **API**
3. Copy these three values:

```bash
# Project URL (should be this)
NEXT_PUBLIC_SUPABASE_URL=https://dscmknufpfhxjcanzdsr.supabase.co

# Anon/Public Key (starts with eyJ...)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Service Role Key (starts with eyJ... - KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Send me these three values** or create a `.env.remote` file with them.

---

### 2. Answer These Questions (2 minutes)

#### Q1: Existing Rum Batches
The database already has 10 rum batches (RUM-23-1 through RUM-24-7).  
Should we:
- [ ] **A.** Keep them and only import missing batches (recommended)
- [ ] **B.** Delete and re-import all batches
- [ ] **C.** Update existing + import new ones (upsert)

**Your choice:** ___________

---

#### Q2: Gin Batch Destination
We have two tables for gin batches:
- `distillation_runs` - Structured schema (44 columns)
- `production_batches` - Flexible JSONB schema

Should we:
- [ ] **A.** Put all gin batches in `distillation_runs` (recommended)
- [ ] **B.** Put all gin batches in `production_batches`
- [ ] **C.** Split: Signature/Rainforest in `distillation_runs`, others in `production_batches`

**Your choice:** ___________

---

#### Q3: Existing Production Batches
The database has 8 production batches (NS-018, DRY-2024, MM-001/002/003, VODKA-003, RF-29/30).  
Should we:
- [ ] **A.** Keep them and import additional batches (recommended)
- [ ] **B.** Delete and re-import all
- [ ] **C.** Review them first before deciding

**Your choice:** ___________

---

#### Q4: Migration Priority
What should we migrate first?
- [ ] **A.** Complete rum production data (~90 batches)
- [ ] **B.** Complete gin production data (~20 batches)
- [ ] **C.** All production data first, then business data
- [ ] **D.** Business data (pricing/sales) first
- [ ] **E.** Everything at once

**Your choice:** ___________

---

## 🚀 Once I Have This Information

I will immediately:

### Phase 1: Setup (30 minutes)
- [ ] Connect to remote database with your credentials
- [ ] Verify access and permissions
- [ ] Export current remote data as backup
- [ ] Document current state

### Phase 2: Create Migration Scripts (2-4 hours)
- [ ] Build upsert scripts for rum production data
- [ ] Build upsert scripts for gin production data
- [ ] Build import scripts for pricing/sales data
- [ ] Add validation and error handling
- [ ] Add progress logging

### Phase 3: Test Locally (1-2 hours)
- [ ] Test all scripts against local database
- [ ] Verify data transformations
- [ ] Check for errors and edge cases
- [ ] Validate data integrity

### Phase 4: Execute Migration (2-4 hours)
- [ ] Migrate rum production data
- [ ] Verify rum data
- [ ] Migrate gin production data
- [ ] Verify gin data
- [ ] Migrate pricing/sales data
- [ ] Verify business data

### Phase 5: Validation (1-2 hours)
- [ ] Count all records (should match JSON files)
- [ ] Spot-check data quality
- [ ] Test application with remote database
- [ ] Document any issues

### Phase 6: Update Application (1-2 hours)
- [ ] Update .env.local to use remote database
- [ ] Remove static JSON imports (or keep as backup)
- [ ] Test all CRUD operations
- [ ] Update documentation

---

## 📊 Expected Results

After migration is complete:

| Table | Current | Target | Status |
|-------|---------|--------|--------|
| `rum_production_runs` | 10 | ~100 | ⏳ Pending |
| `distillation_runs` | 0 | ~20 | ⏳ Pending |
| `production_batches` | 8 | ~50 | ⏳ Pending |
| `product_pricing` | 0 | ~30 | ⏳ Pending |
| `sales_items` | 0 | ~100 | ⏳ Pending |
| **TOTAL** | **18** | **~300** | **⏳ Pending** |

---

## ⏱️ Timeline

**Total Estimated Time:** 1-2 days

- **Day 1 Morning:** Setup + Script Development
- **Day 1 Afternoon:** Testing + Initial Migration
- **Day 2 Morning:** Complete Migration + Validation
- **Day 2 Afternoon:** Application Update + Documentation

---

## 🔒 Safety Measures

We will:
- ✅ Backup remote database before migration
- ✅ Keep all JSON files as backup
- ✅ Use upsert to avoid duplicates
- ✅ Validate after each phase
- ✅ Test application functionality
- ✅ Document all changes
- ✅ Provide rollback procedure

**Zero risk of data loss!**

---

## 📞 Ready When You Are

Just provide:
1. ✅ The 3 Supabase credentials
2. ✅ Answers to the 4 questions
3. ✅ Confirmation to proceed

And I'll get started immediately! 🚀

---

## 💡 Quick Copy-Paste Template

**Email/Message Template:**

```
Hi,

Here are the Supabase credentials:

URL: https://dscmknufpfhxjcanzdsr.supabase.co
ANON KEY: eyJ...
SERVICE ROLE KEY: eyJ...

Answers:
Q1 (Existing rum batches): A / B / C
Q2 (Gin batch destination): A / B / C
Q3 (Existing production batches): A / B / C
Q4 (Migration priority): A / B / C / D / E

Please proceed with the migration.

Thanks!
```

---

## 📚 Reference Documents

- **UPDATED_MIGRATION_STATUS.md** - Detailed current state analysis
- **MIGRATION_ANALYSIS_AND_PLAN.md** - Complete migration plan
- **DATA_INVENTORY.md** - Detailed data inventory
- **CREDENTIALS_NEEDED.md** - How to get credentials

All documents are in the project root directory.


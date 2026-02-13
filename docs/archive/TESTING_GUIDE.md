# 🧪 Remote Database Testing Guide

**Date:** November 7, 2025  
**Environment:** Remote Supabase (dscmknufpfhxjcanzdsr)  
**Application URL:** http://localhost:3001

---

## ✅ Connection Status

The application is now connected to the **remote Supabase database** and is running successfully!

### Server Status
- ✅ Next.js server running on port 3001
- ✅ Environment variables loaded from `.env.local`
- ✅ Remote Supabase URL: `https://dscmknufpfhxjcanzdsr.supabase.co`
- ✅ Pages compiling successfully
- ✅ API endpoints responding

### Database Connection Test Results

| Table | Records | Status | Notes |
|-------|---------|--------|-------|
| **distillation_runs** | 22 | ✅ Accessible | Gin batches loading correctly |
| **rum_production_runs** | 10 | ✅ Accessible | Column name: `distillation_date` (not `date`) |
| **production_batches** | 27 | ✅ Accessible | All batch types available |
| **product_pricing** | 21 | 🔒 RLS Protected | Requires authentication |
| **sales_items** | 15 | 🔒 RLS Protected | Requires authentication |

**Note:** Product pricing and sales items are protected by Row Level Security (RLS) policies. This is **correct security behavior** - users must be authenticated to view this data.

---

## 🧪 Testing Checklist

### 1. Authentication Testing

- [ ] **Navigate to:** http://localhost:3001
- [ ] **Check:** Does the home page load?
- [ ] **Navigate to:** http://localhost:3001/auth/login
- [ ] **Check:** Does the login page load?
- [ ] **Action:** Sign in with your credentials
- [ ] **Expected:** Redirect to dashboard after successful login

### 2. Dashboard Testing

- [ ] **Navigate to:** http://localhost:3001/dashboard
- [ ] **Check:** Does the dashboard load?
- [ ] **Check:** Can you see overview statistics?
- [ ] **Expected:** Dashboard displays with data from remote database

### 3. Production Data Testing

#### Distillation Runs (Gin)
- [ ] **Navigate to:** http://localhost:3001/dashboard/production
- [ ] **Check:** Can you see distillation runs?
- [ ] **Expected:** 22 gin batches displayed
- [ ] **Sample batches to verify:**
  - SPIRIT-GIN-SD-0001 (2021-01-22)
  - SPIRIT-GIN-SD-0020 (2025-04-28)
  - SPIRIT-GIN-RF-28 (Rainforest Gin)
  - SPIRIT-GIN-RF-29 (Rainforest Gin)

#### Production Batches
- [ ] **Navigate to:** http://localhost:3001/dashboard/production/batches
- [ ] **Check:** Can you see production batches?
- [ ] **Expected:** 27 batches displayed
- [ ] **Sample batches to verify:**
  - RUM-24-1 through RUM-24-9
  - CS-24-1, CS-24-2-L, CS-24-2-R (Cane Spirit batches)
  - CS-25-1-L, CS-25-1-R (2025 batches)

#### Rum Production Runs
- [ ] **Navigate to:** http://localhost:3001/rum (or wherever rum data is displayed)
- [ ] **Check:** Can you see rum production runs?
- [ ] **Expected:** 10 rum batches displayed
- [ ] **Sample batches to verify:**
  - RUM-23-1, RUM-23-2, RUM-23-3
  - RUM-24-1 through RUM-24-7

### 4. Product Pricing Testing

- [ ] **Navigate to:** Product pricing page
- [ ] **Check:** Can you see pricing data?
- [ ] **Expected:** 21 products displayed
- [ ] **Sample products to verify:**
  - Australian Cane Spirit
  - Reserve Cask Rum
  - Rainforest Gin 700ml
  - Signature Dry Gin 700ml
  - Navy Strength Gin 700ml

### 5. Sales Data Testing

- [ ] **Navigate to:** Sales/Reports page
- [ ] **Check:** Can you see sales data?
- [ ] **Expected:** 15 sales items displayed
- [ ] **Sample items to verify:**
  - Rainforest Gin 700ml
  - Signature Dry Gin 700ml
  - Gin and Tonic
  - Cocktail

### 6. Data Integrity Testing

- [ ] **Check:** Do botanical formulations display correctly?
- [ ] **Check:** Do distillation logs show proper data?
- [ ] **Check:** Do dilution steps display correctly?
- [ ] **Check:** Are dates formatted properly?
- [ ] **Check:** Are numerical values (ABV, volumes, etc.) correct?

### 7. CRUD Operations Testing

#### Create
- [ ] **Action:** Try creating a new distillation run
- [ ] **Expected:** New record saves to remote database
- [ ] **Verify:** Record appears in Supabase dashboard

#### Read
- [ ] **Action:** View an existing batch detail page
- [ ] **Expected:** All data loads from remote database
- [ ] **Verify:** Data matches what's in Supabase

#### Update
- [ ] **Action:** Edit an existing record
- [ ] **Expected:** Changes save to remote database
- [ ] **Verify:** Changes persist after page refresh

#### Delete
- [ ] **Action:** Delete a test record (if applicable)
- [ ] **Expected:** Record removed from remote database
- [ ] **Verify:** Record no longer appears in app or Supabase

---

## 🔍 Troubleshooting

### Issue: "No data displayed"

**Possible Causes:**
1. Not authenticated - RLS policies require login
2. Wrong organization - User might be in different org
3. Network issue - Check internet connection

**Solutions:**
1. Sign in to the application
2. Check user's organization_id matches data organization_id
3. Check browser console for errors

### Issue: "Connection error"

**Possible Causes:**
1. Environment variables not loaded
2. Supabase project paused/inactive
3. Network/firewall blocking connection

**Solutions:**
1. Restart dev server: `pnpm dev`
2. Check Supabase dashboard for project status
3. Check browser network tab for failed requests

### Issue: "Data looks wrong"

**Possible Causes:**
1. Migration script had errors
2. Data transformation issues
3. Schema mismatch

**Solutions:**
1. Check migration logs in `MIGRATION_COMPLETE.md`
2. Query database directly via Supabase dashboard
3. Re-run migration scripts if needed

---

## 📊 Expected Data Summary

After successful testing, you should see:

| Data Type | Count | Date Range |
|-----------|-------|------------|
| **Gin Batches** | 22 | 2021-01-22 to 2025-04-28 |
| **Rum Batches** | 10 | 2023-2024 |
| **Production Batches** | 27 | 2024-2025 |
| **Products** | 21 | Current catalogue |
| **Sales Items** | 15 | 2025 data |

---

## ✅ Success Criteria

The remote database integration is successful if:

1. ✅ Application loads without errors
2. ✅ Authentication works correctly
3. ✅ All 22 gin batches are visible
4. ✅ All 10 rum batches are visible
5. ✅ All 27 production batches are visible
6. ✅ Product pricing loads (after authentication)
7. ✅ Sales data loads (after authentication)
8. ✅ Can create new records
9. ✅ Can update existing records
10. ✅ Data persists across page refreshes

---

## 🎯 Next Steps After Testing

Once testing is complete:

### If Everything Works ✅
1. Archive static JSON files (don't delete yet)
2. Update documentation
3. Train team on new system
4. Set up automated backups
5. Monitor performance

### If Issues Found ❌
1. Document specific issues
2. Check error logs
3. Review migration scripts
4. Contact support if needed
5. Can rollback to local Supabase if critical

---

## 🔄 Rollback Plan

If you need to switch back to local Supabase:

```bash
# Stop the dev server (Ctrl+C)

# Restore local environment
cp .env.local.backup .env.local
# OR manually edit .env.local to use:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Restart dev server
pnpm dev
```

---

## 📞 Support

**Migration Documentation:** See `MIGRATION_COMPLETE.md`  
**Database Dashboard:** https://supabase.com/dashboard/project/dscmknufpfhxjcanzdsr  
**API Documentation:** https://supabase.com/docs

---

**Generated:** November 7, 2025  
**Status:** Ready for testing  
**Environment:** Remote Supabase (Production-ready)


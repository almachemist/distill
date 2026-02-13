# 🔑 Credentials Needed for Remote Supabase Migration

## Quick Reference: How to Get Your Supabase Credentials

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in with your account
3. You should see your projects listed

### Step 2: Select the Distil Project
- Look for the project named **"distil"**
- Project ID should be: `qjivqslavzczcjbwjkua`
- Region: ap-southeast-2 (Sydney)
- Click on it to open

### Step 3: Get API Credentials
1. In the left sidebar, click **"Settings"** (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You'll see a page with your credentials

### Step 4: Copy These Values

#### Project URL
```
NEXT_PUBLIC_SUPABASE_URL=https://qjivqslavzczcjbwjkua.supabase.co
```
*(This should be visible at the top of the API page)*

#### Anon/Public Key
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```
*(Look for "anon" or "public" key - it's a long JWT token starting with "eyJ")*

#### Service Role Key
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```
*(Look for "service_role" key - **KEEP THIS SECRET!** - also starts with "eyJ")*

---

## What to Send Me

Please create a file called `.env.remote` in the project root with this content:

```bash
# Remote Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qjivqslavzczcjbwjkua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-your-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=<paste-your-service-role-key-here>
```

**OR** just paste the three values in a message:
```
URL: https://qjivqslavzczcjbwjkua.supabase.co
ANON KEY: eyJhbGc...
SERVICE ROLE KEY: eyJhbGc...
```

---

## Security Notes

⚠️ **IMPORTANT:**
- The **Service Role Key** bypasses Row Level Security - keep it secret!
- Never commit it to git
- Only use it in server-side code or migration scripts
- The **Anon Key** is safe to use in client-side code

---

## Additional Questions to Answer

1. **Is `qjivqslavzczcjbwjkua` the correct project?**
   - [ ] Yes, use this project
   - [ ] No, I need to create a new one
   - [ ] No, use a different project: _______________

2. **Does the remote database have any existing data?**
   - [ ] Empty database (fresh start)
   - [ ] Has some test data (can be overwritten)
   - [ ] Has production data (must preserve)

3. **Migration priority - what's most important?**
   - [ ] Rum production data
   - [ ] Gin production data
   - [ ] Pricing/sales data
   - [ ] All equally important

4. **Timeline preference:**
   - [ ] ASAP (I'll work on it immediately)
   - [ ] This week (planned migration)
   - [ ] Next week (more testing needed)

---

## Once I Have the Credentials

I will:
1. ✅ Verify connection to remote database
2. ✅ Check current schema state
3. ✅ Apply any missing migrations
4. ✅ Create and test migration scripts
5. ✅ Perform staged data migration
6. ✅ Verify data integrity
7. ✅ Update application configuration
8. ✅ Test everything works

**Estimated time:** 3-5 days for complete migration

---

## Need Help Getting Credentials?

If you can't find the credentials or don't have access:
1. Check if you're logged into the correct Supabase account
2. Verify you have admin/owner access to the project
3. Contact Supabase support if you've lost access
4. We can create a new project if needed

---

## Alternative: I Can Help You Get Them

If you want, you can:
1. Share your screen (via video call)
2. I'll guide you through finding the credentials
3. You copy/paste them securely

Just let me know what works best for you!


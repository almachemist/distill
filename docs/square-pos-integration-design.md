# Square POS Integration — Design Document

## 1. Overview

Replace static JSON sales/CRM data with live Square POS integration.
Square becomes the source of truth for sales transactions, customer data, and product catalog.
Supabase stores synced copies for fast queries, analytics, and offline access.

## 2. Architecture

```
Square POS ──webhook──► /api/integrations/square/webhook ──► Supabase tables
     │                                                           │
     └──OAuth──► /api/integrations/square/connect            Dashboard
                                                             CRM page
                                                             Sales charts
```

### Sync Strategy
- **Webhook (primary):** Square sends real-time events for new orders, refunds, customer updates.
- **Periodic sync (fallback):** Cron job (Supabase Edge Function or Vercel cron) pulls last 24h of orders to catch missed webhooks.
- **Full sync (on-demand):** Admin can trigger a full historical sync from the settings page.

## 3. Supabase Schema

### `square_connections`
Stores OAuth credentials per organization. One connection per org.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK → organizations | RLS-scoped |
| access_token | text (encrypted) | Square OAuth access token |
| refresh_token | text (encrypted) | Square OAuth refresh token |
| merchant_id | text | Square merchant ID |
| location_ids | text[] | Connected Square location IDs |
| token_expires_at | timestamptz | When access_token expires |
| last_sync_at | timestamptz | Last successful sync timestamp |
| sync_status | text | 'idle' | 'syncing' | 'error' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `square_customers`
Synced customer records from Square.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | RLS-scoped |
| square_customer_id | text UNIQUE | Square's customer ID |
| display_name | text | given_name + family_name |
| email | text | |
| phone | text | |
| company_name | text | |
| first_order_date | date | Computed from orders |
| last_order_date | date | Computed from orders |
| total_spend_cents | bigint | Running total in minor units |
| total_units | int | Running total items purchased |
| order_count | int | |
| metadata | jsonb | Extra Square fields |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `square_orders`
Synced orders from Square.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | RLS-scoped |
| square_order_id | text UNIQUE | Square's order ID |
| square_customer_id | text | FK-like to square_customers |
| location_id | text | Square location |
| state | text | 'OPEN' | 'COMPLETED' | 'CANCELED' |
| total_money_cents | bigint | Total in minor units |
| currency | text | 'AUD' |
| order_date | timestamptz | When the order was placed |
| closed_at | timestamptz | When completed |
| source | text | 'SQUARE_POS' | 'SQUARE_ONLINE' |
| metadata | jsonb | Discounts, taxes, tenders |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `square_order_items`
Line items within orders.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | RLS-scoped |
| square_order_id | text | FK-like to square_orders |
| square_item_id | text | Square catalog item ID |
| item_name | text | Product name at time of sale |
| variation_name | text | e.g. "700ml", "200ml" |
| quantity | numeric | |
| unit_price_cents | bigint | Price per unit |
| total_price_cents | bigint | quantity * unit_price |
| category | text | e.g. "Gin", "Rum", "Merchandise" |
| sku | text | Maps to our product SKU |
| created_at | timestamptz | |

### `square_catalog_items`
Product catalog synced from Square (optional, for SKU mapping).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| organization_id | uuid FK | RLS-scoped |
| square_catalog_id | text UNIQUE | Square catalog object ID |
| name | text | Product name |
| category | text | |
| sku | text | |
| variations | jsonb | [{name, price_cents, square_variation_id}] |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## 4. API Routes

### OAuth Flow
- `GET /api/integrations/square/connect` — Redirects to Square OAuth
- `GET /api/integrations/square/callback` — Handles OAuth callback, stores tokens
- `POST /api/integrations/square/disconnect` — Revokes tokens, deletes connection

### Webhook
- `POST /api/integrations/square/webhook` — Receives Square webhook events
  - `order.created` / `order.updated` → upsert order + items
  - `customer.created` / `customer.updated` → upsert customer
  - Validates Square webhook signature

### Sync
- `POST /api/integrations/square/sync` — Triggers manual sync (admin only)
- `GET /api/integrations/square/status` — Returns connection + sync status

### Analytics (replaces static CRM)
- `GET /api/crm/analytics` — Customer analytics computed from square_orders
- `GET /api/crm/groups` — Customer groups with spend/churn data

## 5. CRM Migration Path

Current CRM flow:
```
sales_processed_temp.json → analytics.ts → crm_analytics_2025.json
customer_groups.json → groups.ts → crm_groups_2025.json
```

New flow:
```
Square POS → webhook → square_orders / square_customers
                              ↓
           Supabase views/queries → CRM dashboard
```

The `getCachedCustomerAnalytics()` and `getCachedCustomerGroups()` functions
will be replaced with Supabase queries against `square_customers` + `square_orders`.

## 6. Implementation Order

1. **Schema:** Create tables with RLS policies
2. **OAuth:** Build connect/disconnect flow
3. **Webhook:** Handle order + customer events
4. **Sync:** Build initial sync + periodic refresh
5. **Analytics:** Replace CRM module with Supabase queries
6. **Dashboard:** Wire sales trend chart to square_orders data
7. **Settings UI:** Square connection management page

## 7. Environment Variables Required

```env
SQUARE_APPLICATION_ID=       # Square app ID
SQUARE_APPLICATION_SECRET=   # Square app secret (server-only)
SQUARE_ENVIRONMENT=sandbox   # 'sandbox' or 'production'
SQUARE_WEBHOOK_SIGNATURE_KEY= # For webhook validation
```

## 8. Security Considerations

- Access/refresh tokens stored encrypted in Supabase (pgcrypto or application-level)
- Webhook endpoint validates Square signature before processing
- All tables have RLS policies using `user_org_ids()` function
- OAuth tokens are never exposed to the client
- Refresh token rotation handled server-side

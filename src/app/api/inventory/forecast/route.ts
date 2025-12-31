import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type MovementRecord = {
  dt: string
  reference?: string
  reason?: string
  changes: Array<{ id: string; sku: string; delta: number; before: number; after: number; note?: string }>
}

type PackagingForecast = {
  perProduct: Record<string, { bottles700: number; bottles200: number }>
  totals: { bottles700: number; bottles200: number }
}

const PRODUCT_RULES: Record<string, { allow200: boolean }> = {
  'Merchant Mae Gin': { allow200: false },
  'Merchant Mae Vodka': { allow200: false },
  'Merchant Mae White Rum': { allow200: false },
  'Coffee Liqueur': { allow200: false },
}

const PKG_NAMES = {
  BOTTLE_700: { name: 'Bottle 700ml' },
  BOTTLE_200: { name: 'Bottle 200ml' },
  CORK_700: { name: 'Cork 700ml' },
  CAP_200: { name: 'Cap 200ml' },
  CARTON_6P_700: { name: 'Carton 6-pack 700ml' },
  SLEEVE_700: { name: 'Tamper Sleeve 700ml' },
  SLEEVE_200: { name: 'Tamper Sleeve 200ml' }
}

function withBuffer(n: number) { return Math.ceil(n * 1.10) }

async function getOrgId(supabase: any): Promise<string> {
  if (process.env.NODE_ENV === 'development') return '00000000-0000-0000-0000-000000000001'
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  if (!profile?.organization_id) throw new Error('User organization not found')
  return profile.organization_id
}

async function findItemByName(supabase: any, org: string, name: string) {
  const { data } = await supabase
    .from('items')
    .select('id, name, default_uom')
    .eq('organization_id', org)
    .eq('name', name)
    .maybeSingle()
  return data
}

async function onHandByItemId(supabase: any, org: string, item_id: string): Promise<number> {
  const { data } = await supabase
    .from('inventory_txns')
    .select('quantity, txn_type')
    .eq('organization_id', org)
    .eq('item_id', item_id)
  return (data || []).reduce((acc: number, t: any) => {
    switch (t.txn_type) {
      case 'RECEIVE':
      case 'PRODUCE':
        return acc + Number(t.quantity || 0)
      case 'CONSUME':
      case 'TRANSFER':
      case 'DESTROY':
      case 'ADJUST':
        return acc - Number(t.quantity || 0)
      default:
        return acc
    }
  }, 0)
}

function parseDate(d: string) { return new Date(d + (d.length === 10 ? 'T00:00:00Z' : '')) }

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const org = await getOrgId(supabase)
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || new Date().toISOString().slice(0,10)
    const to = searchParams.get('to') || '2027-03-31'

    // 1) Get packaging forecast for the range
    const origin = req.nextUrl.origin
    const url = new URL('/api/forecast/packaging', origin)
    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    const pkgRes = await fetch(url.toString(), { cache: 'no-store' })
    if (!pkgRes.ok) {
      const j = await pkgRes.json().catch(() => ({}))
      throw new Error(j.error || 'Failed to load packaging forecast')
    }
    const packaging = (await pkgRes.json()) as PackagingForecast

    // 3) Build SKU-level requirements from per-product bottle counts
    type Req = { key: string; name: string; required: number }
    const reqs: Req[] = []

    const perProduct: Record<string, { bottles700: number; bottles200: number }> = packaging.perProduct || {}
    for (const [product, counts] of Object.entries(perProduct)) {
      const rule = PRODUCT_RULES[product]
      const need700 = withBuffer(counts.bottles700 || 0)
      const need200 = withBuffer(counts.bottles200 || 0)

      if (need700 > 0) {
        reqs.push({ key: PKG_NAMES.BOTTLE_700.name, name: '700ml Bottle', required: need700 })
        reqs.push({ key: PKG_NAMES.CORK_700.name, name: 'Cork (700ml)', required: need700 })
        reqs.push({ key: PKG_NAMES.SLEEVE_700.name, name: 'Tamper Sleeve (700ml)', required: need700 })
        const cartons = Math.ceil(need700 / 6)
        reqs.push({ key: PKG_NAMES.CARTON_6P_700.name, name: 'Carton 6-pack (700ml)', required: cartons })
        reqs.push({ key: `Label 700ml - ${product}`, name: `Label 700ml - ${product}`, required: need700 })
      }

      if (need200 > 0 && (rule ? rule.allow200 : true)) {
        reqs.push({ key: PKG_NAMES.BOTTLE_200.name, name: '200ml Bottle', required: need200 })
        reqs.push({ key: PKG_NAMES.CAP_200.name, name: 'Screw Cap (200ml)', required: need200 })
        reqs.push({ key: PKG_NAMES.SLEEVE_200.name, name: 'Tamper Sleeve (200ml)', required: need200 })
        reqs.push({ key: `Label 200ml - ${product}`, name: `Label 200ml - ${product}`, required: need200 })
      }
    }

    // 4) Combine with available inventory, compute deficit/status/recommendation
    function statusFor(required: number, available: number) {
      if (required <= 0) return 'none'
      if (available >= required) return 'green'
      const ratio = available / required
      return ratio >= 0.8 ? 'yellow' : 'red'
    }

    const rows = [] as any[]
    for (const r of reqs) {
      const item = await findItemByName(supabase, org, r.key)
      const available = item?.id ? await onHandByItemId(supabase, org, item.id) : 0
      const deficit = Math.max(0, r.required - Math.max(0, available))
      rows.push({
        sku: item?.id || r.key,
        name: item?.name || r.name,
        unit: item?.default_uom || 'unit',
        category: 'Packaging',
        required: r.required,
        available: Math.max(0, available),
        deficit,
        status: statusFor(r.required, Math.max(0, available)),
        recommended_purchase: deficit,
        supplier_name: null,
        supplier_contact: null,
        last_invoice_number: null,
        last_invoice_date: null,
        last_cost_price_per_unit: null,
      })
    }

    // Sort by status severity then by deficit desc
    rows.sort((a, b) => {
      const sev = (s: string) => s === 'red' ? 2 : s === 'yellow' ? 1 : 0
      const d = sev(b.status) - sev(a.status)
      if (d !== 0) return d
      return (b.deficit || 0) - (a.deficit || 0)
    })

    return NextResponse.json({
      range: { from, to },
      perProduct: packaging.perProduct || {},
      totals: packaging.totals || { bottles700: 0, bottles200: 0 },
      skuForecast: rows,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to compute inventory forecast'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

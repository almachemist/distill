import { NextRequest, NextResponse } from 'next/server'
import { readJson } from '@/lib/jsonStore'
import type { InventoryItem, Supplier } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INVENTORY_PATH = 'data/inventory.json'
const MOVEMENTS_PATH = 'data/inventory_movements.json'
const SUPPLIERS_PATH = 'data/suppliers.json'

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

const SPIRIT_SKUS: Record<string, { sku700?: string; sku200?: string; label700?: string; label200?: string; forbid200?: boolean }> = {
  'Rainforest Gin': { sku700: 'RAIN-700', sku200: 'RAIN-200', label700: 'LBL-RAIN-700', label200: 'LBL-RAIN-200' },
  'Signature Gin': { sku700: 'SIGN-700', sku200: 'SIGN-200', label700: 'LBL-SIGN-700', label200: 'LBL-SIGN-200' },
  'Navy Strength Gin': { sku700: 'NAVY-700', sku200: 'NAVY-200', label700: 'LBL-NAVY-700', label200: 'LBL-NAVY-200' },
  'Merchant Mae Gin': { sku700: 'MM-GIN-700', label700: 'LBL-MMGIN-700', forbid200: true },
  'Merchant Mae Vodka': { sku700: 'MM-VODKA-700', label700: 'LBL-MMVODKA-700', forbid200: true },
  'Merchant Mae White Rum': { sku700: 'MM-WR-700', label700: 'LBL-MMWR-700', forbid200: true },
  'Australian Cane Spirit': { sku700: 'CANE-700', sku200: 'CANE-200', label700: 'LBL-CANE-700', label200: 'LBL-CANE-200' },
  'Spiced Rum': { sku700: 'SPICED-700', sku200: 'SPICED-200', label700: 'LBL-SPICED-700', label200: 'LBL-SPICED-200' },
  'Coffee Liqueur': { sku700: 'COFFEE-700', label700: 'LBL-COFFEE-700', forbid200: true },
}

const PKG = {
  BOTTLE_700: 'PKG-BOTTLE-700',
  BOTTLE_200: 'PKG-BOTTLE-200',
  CORK_700: 'PKG-CORK-700',
  CAP_200: 'PKG-CAP-200',
  SLEEVE_700: 'PKG-SLEEVE-700',
  SLEEVE_200: 'PKG-SLEEVE-200',
  CARTON_6P_700: 'PKG-CARTON-6P-700',
}

function withBuffer(n: number) { return Math.ceil(n * 1.10) }

function sumMovementsBySku(records: MovementRecord[]) {
  const map = new Map<string, number>()
  for (const r of records) for (const ch of r.changes || []) map.set(ch.sku, (map.get(ch.sku) || 0) + Number(ch.delta || 0))
  return map
}

function parseDate(d: string) { return new Date(d + (d.length === 10 ? 'T00:00:00Z' : '')) }

export async function GET(req: NextRequest) {
  try {
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

    // 2) Load inventory baseline + derive current via movements
    const [items, movementRecs, suppliers] = await Promise.all([
      readJson<InventoryItem[]>(INVENTORY_PATH, []),
      readJson<MovementRecord[]>(MOVEMENTS_PATH, []),
      readJson<Supplier[]>(SUPPLIERS_PATH, []),
    ])
    const sums = sumMovementsBySku(movementRecs)
    const derivedBySku = new Map<string, { item: InventoryItem | undefined; available: number }>()
    for (const it of items) {
      const available = Number(it.currentStock || 0) + (sums.get(it.sku) || 0)
      derivedBySku.set(it.sku, { item: it, available })
    }

    const supplierById = new Map(suppliers.map(s => [s.id, s]))

    // 3) Build SKU-level requirements from per-product bottle counts
    type Req = { sku: string; name?: string; required: number }
    const reqBySku = new Map<string, Req>()

    const perProduct: Record<string, { bottles700: number; bottles200: number }> = packaging.perProduct || {}
    for (const [product, counts] of Object.entries(perProduct)) {
      const map = SPIRIT_SKUS[product]
      if (!map) continue
      const need700 = withBuffer(counts.bottles700 || 0)
      const need200 = withBuffer(counts.bottles200 || 0)

      if (need700 > 0) {
        for (const [sku, name] of [
          [PKG.BOTTLE_700, '700ml Bottle'],
          [PKG.CORK_700, 'Cork (700ml)'],
          [PKG.SLEEVE_700, 'Tamper Sleeve (700ml)'],
          [map.label700, `${product} Label 700ml`],
        ] as const) {
          if (!sku) continue
          const cur = reqBySku.get(sku) || { sku, name, required: 0 }
          cur.required += need700
          reqBySku.set(sku, cur)
        }
        // cartons: ceil per 6 bottles
        const cartons = Math.ceil(need700 / 6)
        const csku = PKG.CARTON_6P_700
        const cur = reqBySku.get(csku) || { sku: csku, name: 'Carton 6-pack (700ml)', required: 0 }
        cur.required += cartons
        reqBySku.set(csku, cur)
      }

      if (need200 > 0 && !map.forbid200) {
        for (const [sku, name] of [
          [PKG.BOTTLE_200, '200ml Bottle'],
          [PKG.CAP_200, 'Screw Cap (200ml)'],
          [PKG.SLEEVE_200, 'Tamper Sleeve (200ml)'],
          [map.label200, `${product} Label 200ml`],
        ] as const) {
          if (!sku) continue
          const cur = reqBySku.get(sku) || { sku, name, required: 0 }
          cur.required += need200
          reqBySku.set(sku, cur)
        }
      }
    }

    // 4) Combine with available inventory, compute deficit/status/recommendation
    function statusFor(required: number, available: number) {
      if (required <= 0) return 'none'
      if (available >= required) return 'green'
      const ratio = available / required
      return ratio >= 0.8 ? 'yellow' : 'red'
    }

    const rows = Array.from(reqBySku.values()).map((r) => {
      const rec = derivedBySku.get(r.sku)
      const available = Math.max(0, rec?.available ?? 0)
      const deficit = Math.max(0, r.required - available)
      const item = rec?.item
      const supplier = item?.supplierId ? supplierById.get(item.supplierId) : undefined
      return {
        sku: r.sku,
        name: item?.name || r.name || r.sku,
        unit: item?.unit || 'unit',
        category: item?.category || 'Packaging',
        required: r.required,
        available,
        deficit,
        status: statusFor(r.required, available),
        recommended_purchase: deficit, // TODO: round to supplier MOQ if provided
        supplier_name: supplier?.name || null,
        supplier_contact: supplier?.contactName || null,
        last_invoice_number: item?.lastInvoiceNumber || null,
        last_invoice_date: item?.lastInvoiceDate || null,
        last_cost_price_per_unit: item?.lastPurchaseCost ?? null,
      }
    })

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


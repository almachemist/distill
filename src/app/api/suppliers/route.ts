import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonStore'
import { Supplier } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPLIERS_PATH = 'data/suppliers.json'

export async function GET() {
  try {
    const suppliers = await readJson<Supplier[]>(SUPPLIERS_PATH, [])
    return NextResponse.json(suppliers, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load suppliers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    if (!payload?.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    const suppliers = await readJson<Supplier[]>(SUPPLIERS_PATH, [])
    const id = (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
    const supplier: Supplier = { id, ...payload }
    suppliers.push(supplier)
    await writeJson(SUPPLIERS_PATH, suppliers)
    return NextResponse.json(supplier, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create supplier' }, { status: 500 })
  }
}


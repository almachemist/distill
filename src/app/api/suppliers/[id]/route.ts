import { NextRequest, NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/jsonStore'
import { Supplier } from '@/types/inventory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPLIERS_PATH = 'data/suppliers.json'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const suppliers = await readJson<Supplier[]>(SUPPLIERS_PATH, [])
    const idx = suppliers.findIndex(s => s.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const patch = await req.json()
    suppliers[idx] = { ...suppliers[idx], ...patch, id }
    await writeJson(SUPPLIERS_PATH, suppliers)
    return NextResponse.json(suppliers[idx])
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update supplier' }, { status: 500 })
  }
}


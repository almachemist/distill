'use client'

import { Suspense } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Summary = {
  spiritType: string
  volume: number
  bottleSize: number
  quantity: number
}

function SummaryInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [data, setData] = useState<Summary>({ spiritType: '', volume: 0, bottleSize: 700, quantity: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const spiritType = params.get('spiritType') || ''
    const volume = Number(params.get('volume') || 0)
    const bottleSize = Number(params.get('bottleSize') || 700)
    const quantityParam = Number(params.get('quantity') || 0)
    const calcQty = quantityParam || Math.floor((volume * 1000) / bottleSize)
    setData({ spiritType, volume, bottleSize, quantity: calcQty })
  }, [params])

  const estimates = useMemo(() => {
    const bottles = data.quantity
    const closures = bottles
    const labels = bottles * 2
    const cartons6 = data.bottleSize === 700 ? Math.ceil(bottles / 6) : 0
    const producedName = `${data.spiritType} ${data.bottleSize}ml`
    return { bottles, closures, labels, cartons6, producedName }
  }, [data])

  async function confirmSave() {
    try {
      setSaving(true)
      setError(null)
      const payload = {
        productType: 'rum',
        productName: data.spiritType,
        mode: 'standard',
        selectedBatches: [],
        dilutionPhases: [],
        bottleEntries: [{ size_ml: data.bottleSize, quantity: data.quantity }],
        summary: { volume_l: data.volume, bottle_size_ml: data.bottleSize, bottles: data.quantity },
        notes: 'Bottling summary confirm'
      }
      const res = await fetch('/api/production/bottling-runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to save bottling run')
      }
      const j = await res.json()
      const finishedName = estimates.producedName
      router.push(`/dashboard/inventory?category=Spirits&search=${encodeURIComponent(finishedName)}`)
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function editAgain() {
    const qs = new URLSearchParams({
      spiritType: data.spiritType,
      volume: String(data.volume),
      bottleSize: String(data.bottleSize),
      quantity: String(data.quantity)
    })
    router.push(`/dashboard/production/bottling?${qs.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bottling Summary</h1>
          <p className="text-gray-600 text-sm">Review, edit or confirm before saving</p>
        </div>
        <div className="flex gap-2">
          <button onClick={editAgain} className="px-4 py-2 rounded-md border">Edit</button>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-md border">Cancel</button>
          <button onClick={confirmSave} disabled={saving} className="px-4 py-2 rounded-md bg-green-600 text-white">{saving ? 'Saving…' : 'Confirm Save'}</button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Spirit</span><span className="font-medium">{data.spiritType || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Volume</span><span className="font-medium">{data.volume} L</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Bottle Size</span><span className="font-medium">{data.bottleSize} ml</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Bottles</span><span className="font-medium">{data.quantity}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Consumption & Output</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Bottles</span><span className="font-medium">{estimates.bottles}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Closures</span><span className="font-medium">{estimates.closures}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Labels</span><span className="font-medium">{estimates.labels}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Cartons (6)</span><span className="font-medium">{estimates.cartons6}</span></div>
            <div className="border-t pt-3 flex justify-between"><span className="text-gray-600">Finished Good</span><span className="font-medium">{estimates.producedName}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Next</h3>
        <p className="text-blue-700 text-sm mb-3">After confirming, you will be redirected to Inventory filtered to the finished product.</p>
        <button onClick={() => router.push(`/dashboard/inventory?category=Spirits&search=${encodeURIComponent(estimates.producedName)}`)} className="px-4 py-2 rounded-md bg-blue-600 text-white">Preview Inventory</button>
      </div>
    </div>
  )
}

export default function BottlingSummaryPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading…</div>}>
      <SummaryInner />
    </Suspense>
  )
}

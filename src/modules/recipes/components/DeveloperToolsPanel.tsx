'use client'

interface DeveloperToolsPanelProps {
  show: boolean
  seeding: boolean
  importing: boolean
  jsonInput: string
  importMessage: string | null
  importError: string | null
  onJsonInputChange: (v: string) => void
  onImportJson: () => void
  onImportFormulations: () => void
  onImportProvidedJson: () => void
  seedMasterInventory: () => void
  seedInventoryData: () => void
  seedRainforestGin: () => void
  seedSignatureGin: () => void
  seedNavyGin: () => void
  seedMMGin: () => void
  seedDrySeasonGin: () => void
  seedWetSeasonGin: () => void
}

export function DeveloperToolsPanel({
  show,
  seeding,
  importing,
  jsonInput,
  importMessage,
  importError,
  onJsonInputChange,
  onImportJson,
  onImportFormulations,
  onImportProvidedJson,
  seedMasterInventory,
  seedInventoryData,
  seedRainforestGin,
  seedSignatureGin,
  seedNavyGin,
  seedMMGin,
  seedDrySeasonGin,
  seedWetSeasonGin,
}: DeveloperToolsPanelProps) {
  if (!show) return null

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={seedMasterInventory} disabled={seeding} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          Seed master inventory
        </button>
        <button type="button" onClick={seedInventoryData} disabled={seeding} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          Seed inventory data
        </button>
        <button type="button" onClick={seedRainforestGin} disabled={seeding} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
          Seed Rainforest Gin
        </button>
        <button type="button" onClick={seedSignatureGin} disabled={seeding} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
          Seed Signature Dry Gin
        </button>
        <button type="button" onClick={seedNavyGin} disabled={seeding} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
          Seed Navy Strength Gin
        </button>
        <button type="button" onClick={seedMMGin} disabled={seeding} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
          Seed MM Gin
        </button>
        <button type="button" onClick={seedDrySeasonGin} disabled={seeding} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
          Seed Dry Season Gin
        </button>
        <button type="button" onClick={seedWetSeasonGin} disabled={seeding} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
          Seed Wet Season Gin
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700" htmlFor="recipes-json-input">
          Import recipes JSON
        </label>
        <textarea
          id="recipes-json-input"
          value={jsonInput}
          onChange={(e) => onJsonInputChange(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste recipes JSON here"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onImportJson} disabled={importing || !jsonInput.trim()} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
            {importing ? 'Importing…' : 'Import JSON'}
          </button>
          <button type="button" onClick={onImportFormulations} disabled={importing} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
            {importing ? 'Importing…' : 'Import formulations'}
          </button>
          <button type="button" onClick={onImportProvidedJson} disabled={importing} className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:opacity-60">
            Import provided sample
          </button>
        </div>
        {(importMessage || importError) && (
          <div className="text-sm">
            {importMessage && <p className="text-emerald-700">{importMessage}</p>}
            {importError && <p className="text-red-600">{importError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

// Import all gin session files
import { spiritGinNS018BulletproofData } from '../src/modules/production/sessions/spirit-gin-ns018-distillation.session'
import { spiritGinDry2024BulletproofData } from '../src/modules/production/sessions/spirit-gin-dry2024-distillation.session'
import { spiritGinOaks005WsBulletproofData } from '../src/modules/production/sessions/spirit-gin-oaks005-ws-distillation.session'
import spiritGinRF28BulletproofData from '../src/modules/production/sessions/spirit-gin-rf28-distillation.session'
import spiritGinSD0019BulletproofData from '../src/modules/production/sessions/spirit-gin-sd0019-distillation.session'

// Combine all gin batches
const allGinBatches = [
  spiritGinNS018BulletproofData,
  spiritGinDry2024BulletproofData,
  spiritGinOaks005WsBulletproofData,
  spiritGinRF28BulletproofData,
  spiritGinSD0019BulletproofData
]

// Prepare output directory
const OUTPUT_DIR = path.resolve(process.cwd(), 'supabase', 'exports')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'gin-batches.json')

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true })

// Write to file
writeFileSync(OUTPUT_FILE, JSON.stringify(allGinBatches, null, 2), 'utf8')

console.log(`Exported ${allGinBatches.length} gin batches to ${OUTPUT_FILE}`)

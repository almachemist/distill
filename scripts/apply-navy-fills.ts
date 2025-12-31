import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const p = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf-8')
    c.split('\n').forEach(l => {
      const m = l.trim().match(/^([^=]+)=(.+)$/)
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '')
    })
  }
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
  const supabase = createClient(url, key)

  const inputPath = process.argv[2] || path.join(process.cwd(), 'data', 'reconciliation', 'navy_fill_suggestions.json')
  const raw = fs.readFileSync(inputPath, 'utf-8')
  const parsed = JSON.parse(raw)
  const items: any[] = Array.isArray(parsed) ? parsed : (parsed.items || [])
  if (!items.length) { console.error('No suggestions to apply'); process.exit(1) }

  let ok = 0, fail = 0
  for (const it of items) {
    const batchId = String(it.batch_id || '').trim()
    const update = it.update || {}
    if (!batchId || !Object.keys(update).length) continue
    const { error } = await supabase.from('distillation_runs').update(update).eq('batch_id', batchId)
    if (error) { console.log(`Fail ${batchId}: ${error.message}`); fail++ } else { console.log(`OK ${batchId}`); ok++ }
  }
  console.log(`Applied: ${ok}, Failed: ${fail}`)
}

main()

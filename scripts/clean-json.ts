import * as fs from 'fs'
import * as path from 'path'

function extractJsonObjects(text: string) {
  const out: string[] = []
  let inString = false, escape = false, depth = 0, start = -1
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
    } else {
      if (ch === '"') inString = true
      else if (ch === '{') { if (depth === 0) start = i; depth++ }
      else if (ch === '}') { if (depth > 0 && --depth === 0 && start >= 0) { out.push(text.slice(start, i + 1)); start = -1 } }
    }
  }
  return out
}

function extractBlocksSimple(text: string) {
  const out: string[] = []
  let depth = 0, start = -1
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') { if (depth === 0) start = i; depth++ }
    else if (ch === '}') { if (depth > 0) { depth--; if (depth === 0 && start >= 0) { out.push(text.slice(start, i + 1)); start = -1 } } }
  }
  return out
}

const inPath = process.argv[2]
const outPath = process.argv[3] || path.join(process.cwd(), 'scripts', 'check', 'navycheck.cleaned.json')
if (!inPath) { console.error('Uso: tsx scripts/clean-json.ts <input> [output]'); process.exit(1) }

const buf = fs.readFileSync(inPath)
const rawUtf8 = buf.toString('utf-8')
const td16 = typeof (global as any).TextDecoder !== 'undefined' ? new (global as any).TextDecoder('utf-16le') : null
const rawUtf16 = td16 ? td16.decode(buf) : ''
function sanitize(s: string) {
  return s
    .replace(/\uFEFF/g, '')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B-\u200D]/g, '')
    .replace(/\u2060/g, '')
    .replace(/\u180E/g, '')
    .replace(/\p{Cf}/gu, '')
    .replace(/\p{Zl}|\p{Zp}/gu, '\n')
    .replace(/\p{Zs}/gu, ' ')
}
let raw = sanitize(rawUtf8)
console.log(`Preview: ${raw.slice(0, 200).replace(/\s+/g, ' ').trim()}`)
console.log(`Braces: {${(raw.match(/\{/g) || []).length}} }${(raw.match(/\}/g) || []).length}`)
let items: any[] = []
let chunks: string[] = []
try {
  const parsed = JSON.parse(raw)
  if (Array.isArray(parsed)) items = parsed
  else items = [parsed]
} catch {
chunks = extractJsonObjects(raw)
for (const c of chunks) {
  try {
    items.push(JSON.parse(c))
  } catch {
    const fixed = c.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']')
    try { items.push(JSON.parse(fixed)) } catch {}
  }
}
  if (items.length === 0) {
    if (rawUtf16 && rawUtf16.length > 0) {
      raw = sanitize(rawUtf16)
      console.log(`Preview(utf16): ${raw.slice(0, 200).replace(/\s+/g, ' ').trim()}`)
      console.log(`Braces(utf16): {${(raw.match(/\{/g) || []).length}} }${(raw.match(/\}/g) || []).length}`)
      chunks = extractJsonObjects(raw)
      if (chunks.length) {
        for (const c of chunks) {
          try { items.push(JSON.parse(c)) } catch { const fixed = c.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']'); try { items.push(JSON.parse(fixed)) } catch {} }
        }
      }
    }
    const noTrailingCommas = raw.replace(/,\s*([}\]])/g, '$1')
    const normalized = noTrailingCommas.trim().replace(/\}\s*[\r\n]+\s*\{/g, '},{')
    const asArrayText = `[${normalized}]`
    try {
      const arr = JSON.parse(asArrayText)
      if (Array.isArray(arr)) items = arr
    } catch {}
    if (items.length === 0) {
      const withCommas = raw.replace(/\n\}\s*\n\s*\{/g, '\n},\n{')
      const wrapped = `[\n${withCommas}\n]`
      try {
        const arr2 = JSON.parse(wrapped)
        if (Array.isArray(arr2)) items = arr2
      } catch {}
    }
  }
}
  if (items.length === 0 && chunks.length > 0) {
    const fixedChunks = chunks.map(c => c.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']'))
    const arrayText = `[` + fixedChunks.join(',\n') + `]`
  try {
    const parsed = JSON.parse(arrayText)
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2))
    console.log(`Cleaned JSON: ${outPath}`)
    console.log(`Objects extracted: ${parsed.length}`)
    process.exit(0)
  } catch {
    fs.writeFileSync(outPath, arrayText)
    console.log(`Cleaned JSON (raw array text): ${outPath}`)
    console.log(`Chunks found: ${chunks.length}`)
    process.exit(0)
  }
  } else {
  if (items.length === 0) {
    const splits = raw.split(/\}\s*\n\s*\{/g)
    if (splits.length > 1) {
      const blocks = splits.map((s, i) => (i === 0 ? s : '{' + s) + (i === splits.length - 1 ? '' : '}'))
      const fixedBlocks = blocks.map(b => b.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']'))
      const arrText = `[` + fixedBlocks.join(',\n') + `]`
      try {
        const parsed2 = JSON.parse(arrText)
        fs.writeFileSync(outPath, JSON.stringify(parsed2, null, 2))
        console.log(`Cleaned JSON: ${outPath}`)
        console.log(`Objects extracted: ${parsed2.length}`)
        process.exit(0)
      } catch {
        fs.writeFileSync(outPath, arrText)
        console.log(`Cleaned JSON (raw array text): ${outPath}`)
        console.log(`Chunks found by splits: ${splits.length}`)
        process.exit(0)
      }
    }
    if (items.length === 0) {
      const simpleChunks = extractBlocksSimple(raw)
      if (simpleChunks.length > 0) {
        const fixedChunks = simpleChunks.map(c => c.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']'))
        const arrText = `[` + fixedChunks.join(',\n') + `]`
        try {
          const parsed3 = JSON.parse(arrText)
          fs.writeFileSync(outPath, JSON.stringify(parsed3, null, 2))
          console.log(`Cleaned JSON: ${outPath}`)
          console.log(`Objects extracted: ${parsed3.length}`)
          process.exit(0)
        } catch {
          fs.writeFileSync(outPath, arrText)
          console.log(`Cleaned JSON (raw array text): ${outPath}`)
          console.log(`Chunks found by simple: ${simpleChunks.length}`)
          process.exit(0)
        }
      }
    }
  }
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2))
  console.log(`Cleaned JSON: ${outPath}`)
  console.log(`Objects extracted: ${items.length}`)
  }

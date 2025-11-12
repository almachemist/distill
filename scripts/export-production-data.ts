import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)

const datasetPath = path.resolve(process.cwd(), 'src/modules/production/data/rum-batches.dataset.ts')
const source = readFileSync(datasetPath, 'utf8')

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText

const moduleStub: { exports: Record<string, unknown> } = { exports: {} }
const loader = new Function(
  'exports',
  'require',
  'module',
  '__filename',
  '__dirname',
  transpiled,
)
loader(moduleStub.exports, require, moduleStub as any, datasetPath, path.dirname(datasetPath))

const rumBatchesDataset = moduleStub.exports.rumBatchesDataset as unknown[]

if (!Array.isArray(rumBatchesDataset)) {
  throw new Error('Failed to load rumBatchesDataset from TypeScript source')
}

const OUTPUT_DIR = path.resolve(process.cwd(), 'supabase', 'exports')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'rum-production-runs.json')

mkdirSync(OUTPUT_DIR, { recursive: true })
writeFileSync(OUTPUT_FILE, JSON.stringify(rumBatchesDataset, null, 2), 'utf8')

console.log(`Exported ${rumBatchesDataset.length} runs to ${OUTPUT_FILE}`)

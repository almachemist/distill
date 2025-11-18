import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

async function ensureDir(dir: string) {
  try { await fsp.mkdir(dir, { recursive: true }) } catch {}
}

export async function readJson<T>(relPath: string, defaultValue: T): Promise<T> {
  const full = path.join(process.cwd(), relPath)
  await ensureDir(path.dirname(full))
  try {
    const raw = await fsp.readFile(full, 'utf-8')
    return JSON.parse(raw) as T
  } catch (e: any) {
    if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) {
      await writeJson(relPath, defaultValue)
      return defaultValue
    }
    throw e
  }
}

export async function writeJson<T>(relPath: string, data: T): Promise<void> {
  const full = path.join(process.cwd(), relPath)
  await ensureDir(path.dirname(full))
  const tmp = `${full}.tmp-${Date.now()}`
  const json = JSON.stringify(data, null, 2)
  await fsp.writeFile(tmp, json, 'utf-8')
  // Atomic replace
  await fsp.rename(tmp, full)
}

export function fileExistsSync(relPath: string): boolean {
  try {
    fs.accessSync(path.join(process.cwd(), relPath))
    return true
  } catch {
    return false
  }
}


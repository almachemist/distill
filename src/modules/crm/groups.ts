import fs from 'fs'
import path from 'path'
import { getCachedCustomerAnalytics } from './analytics'
import type { CustomerAnalytics } from '@/db/schemas/customerAnalytics'
import type { CustomerGroupDef, CustomerGroupView, GroupChild } from '@/db/schemas/customerGroup'

function slugify(s: string) {
  const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return slug || 'unknown'
}

function getPaths() {
  const root = process.cwd()
  return {
    defs: path.join(root, 'data', 'customer_groups.json'),
    cache: path.join(root, 'data', 'crm_groups_2025.json'),
    analyticsCache: path.join(root, 'data', 'crm_analytics_2025.json'),
  }
}

function loadGroupDefs(): CustomerGroupDef[] {
  const { defs } = getPaths()
  if (!fs.existsSync(defs)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(defs, 'utf-8'))
    return (raw.customerGroups || []) as CustomerGroupDef[]
  } catch {
    return []
  }
}

function isCacheFresh(): boolean {
  const { cache, defs, analyticsCache } = getPaths()
  if (!fs.existsSync(cache)) return false
  try {
    const c = fs.statSync(cache).mtimeMs
    const d = fs.existsSync(defs) ? fs.statSync(defs).mtimeMs : 0
    const a = fs.existsSync(analyticsCache) ? fs.statSync(analyticsCache).mtimeMs : 0
    return c >= d && c >= a
  } catch {
    return false
  }
}

function normalizeForMatching(s: string): string {
  // Normalize: lowercase, remove special chars, collapse whitespace
  return s
    .toLowerCase()
    .replace(/['']/g, "'")  // Normalize apostrophes
    .replace(/[^\w\s]/g, ' ')  // Replace special chars with space
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .trim()
}

function inAliases(name: string, aliases: string[]) {
  const n = normalizeForMatching(name)
  return aliases.some(a => {
    const al = normalizeForMatching(a)
    // Exact match or customer name contains the full alias (not vice versa)
    // This prevents "N" from matching "Hemingways" but allows "Sails Cairns" to match "Sails"
    return n === al || n.includes(al)
  })
}

function buildFromChildren(def: CustomerGroupDef, children: CustomerAnalytics[], uniqueId?: string): CustomerGroupView | null {
  if (!children.length) return null
  const totalSpend = children.reduce((s, c) => s + c.totalSpend, 0)
  const totalUnits = children.reduce((s, c) => s + c.totalUnits, 0)
  const firstPurchase = children.map(c => c.firstOrderDate).sort()[0]
  const lastPurchase = children.map(c => c.lastOrderDate).sort().slice(-1)[0]
  const daysSinceLastOrder = Math.min(...children.map(c => c.daysSinceLastOrder))
  const avgBetween = children.length
    ? children.reduce((s, c) => s + (c.averageDaysBetweenOrders || 30), 0) / children.length
    : 30
  const churnRisk = Math.min(100, Math.round((daysSinceLastOrder / Math.max(1, avgBetween)) * 100))
  const childAccounts: GroupChild[] = children.map(c => ({
    customerId: c.customerId,
    customerName: c.customerName,
    totalSpend: c.totalSpend,
    totalUnits: c.totalUnits,
    firstOrderDate: c.firstOrderDate,
    lastOrderDate: c.lastOrderDate,
    daysSinceLastOrder: c.daysSinceLastOrder,
    averageDaysBetweenOrders: c.averageDaysBetweenOrders,
    churnRisk: c.churnRisk,
  }))

  // Use uniqueId if provided (for singletons), otherwise slugify groupName
  const id = uniqueId || slugify(def.groupName)

  return {
    id,
    groupName: def.groupName,
    aliases: def.aliases || [],
    emails: def.emails || [],
    totalSpend: Number(totalSpend.toFixed(2)),
    totalUnits: Math.round(totalUnits),
    firstPurchase,
    lastPurchase,
    daysSinceLastOrder,
    averageDaysBetweenOrders: Number(avgBetween.toFixed(1)),
    churnRisk,
    childAccounts,
  }
}

export function generateAndCacheCustomerGroups(): CustomerGroupView[] {
  const defs = loadGroupDefs()
  const customers = getCachedCustomerAnalytics()
  const matched = new Set<string>()
  const groups: CustomerGroupView[] = []

  // Explicit groups first
  for (const def of defs) {
    const children = customers.filter(c => inAliases(c.customerName, def.aliases))
    for (const c of children) matched.add(c.customerId)
    const view = buildFromChildren(def, children)
    if (view) groups.push(view)
  }

  // Singletons for remaining customers (so list stays complete)
  const remaining = customers.filter(c => !matched.has(c.customerId))
  for (const c of remaining) {
    // Use customerId as unique ID for singletons to avoid duplicates
    const uniqueId = `customer-${c.customerId.toLowerCase()}`
    const view = buildFromChildren({ groupName: c.customerName, aliases: [c.customerName] }, [c], uniqueId)
    if (view) groups.push(view)
  }

  const { cache } = getPaths()
  fs.writeFileSync(cache, JSON.stringify({ generatedAt: new Date().toISOString(), groups }, null, 2), 'utf-8')
  return groups
}

export function getCachedCustomerGroups(): CustomerGroupView[] {
  if (isCacheFresh()) {
    const { cache } = getPaths()
    try {
      const raw = JSON.parse(fs.readFileSync(cache, 'utf-8'))
      return raw.groups as CustomerGroupView[]
    } catch {
      // fallthrough
    }
  }
  return generateAndCacheCustomerGroups()
}


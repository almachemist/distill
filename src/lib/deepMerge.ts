import { generateUUID } from '@/types/schema';

function isObj(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

export function ensureArrayIds<T extends { id?: string }>(arr: T[]): T[] {
  return (arr ?? []).map(item => ({ id: item.id ?? generateUUID(), ...item }));
}

export function deepMerge(existing: any, patch: any): any {
  if (Array.isArray(existing) && Array.isArray(patch)) {
    // match by id when present; append new
    const byId = new Map<string, any>();
    const result: any[] = [];

    const withIdsExisting = ensureArrayIds(existing);
    const withIdsPatch = ensureArrayIds(patch);

    withIdsExisting.forEach(item => byId.set(item.id!, item));

    withIdsPatch.forEach(item => {
      const cur = byId.get(item.id!);
      if (cur) {
        result.push(deepMerge(cur, item));
        byId.delete(item.id!);
      } else {
        result.push(item);
      }
    });

    // keep any remaining existing items that weren't in the patch
    result.push(...byId.values());
    return result;
  }

  if (isObj(existing) && isObj(patch)) {
    const out: any = { ...existing };
    for (const k of Object.keys(patch)) {
      const pv = (patch as any)[k];
      const ev = (existing as any)[k];
      if (pv === undefined) continue; // never write undefined (Firestore will drop key)
      if (pv === null) { out[k] = null; continue; } // explicit null keeps the field
      out[k] = deepMerge(ev, pv);
    }
    return out;
  }

  // primitives: patch wins (numbers/strings/booleans)
  return patch;
}

// Helper function to calculate LAL
export function calcLAL(volume_L?: number|null, abv_percent?: number|null): number|null {
  if (volume_L == null || abv_percent == null) return null;
  return Number((volume_L * (abv_percent/100)).toFixed(1));
}

// Helper function to sanitize data (remove undefined, keep null)
export function sanitizeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (_k, v) => (v === undefined ? null : v)));
}


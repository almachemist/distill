import { createClient } from '@/lib/supabase/client'
import { getOrganizationId } from '@/lib/auth/get-org-id'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Barrel,
  CreateBarrelData,
  UpdateBarrelData,
  BarrelFilter,
  BarrelStats,
  BarrelMovement,
  BarrelSample,
} from '../types/barrel.types'

const normalizeDate = (value?: any): string => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  const direct = Date.parse(raw)
  if (Number.isFinite(direct)) {
    return new Date(direct).toISOString()
  }

  const match = raw.match(/^([0-9]{1,2})[\/\-]([0-9]{1,2})[\/\-]([0-9]{2,4})$/)
  if (match) {
    let day = parseInt(match[1], 10)
    let month = parseInt(match[2], 10)
    let year = parseInt(match[3], 10)

    if (year < 100) {
      year += 2000
    }

    if (day <= 12 && month > 12) {
      const tmp = day
      day = month
      month = tmp
    }

    const ts = Date.UTC(year, month - 1, day)
    if (Number.isFinite(ts)) {
      return new Date(ts).toISOString()
    }
  }

  return ''
}

export class BarrelService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  async createBarrel(data: CreateBarrelData): Promise<Barrel> {
    const organizationId = await getOrganizationId()

    const { data: barrel, error } = await this.supabase
      .from('tracking')
      .insert({
        barrel_number: data.barrelNumber, // Human-readable barrel number
        organization_id: organizationId,
        spirit: data.spiritType,
        prev_spirit: data.prevSpirit,
        barrel: data.barrelType,
        volume: data.currentVolume.toString(),
        date_filled: data.fillDate,
        location: data.location,
        abv: data.abv.toString(),
        notes_comments: data.notes,
        status: 'Aging',
        created_by: organizationId, // Use organization ID as fallback
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToBarrel(barrel)
  }

  async getBarrels(filter?: BarrelFilter): Promise<Barrel[]> {
    const organizationId = await getOrganizationId()

    let query = this.supabase.from('tracking').select('*')
      .eq('organization_id', organizationId)

    if (filter) {
      if (filter.status) {
        query = query.eq('status', filter.status)
      }
      if (filter.spiritType) {
        query = query.eq('spirit', filter.spiritType)
      }
      if (filter.location) {
        query = query.eq('location', filter.location)
      }
      if (filter.barrelType) {
        query = query.eq('barrel', filter.barrelType)
      }
      if (filter.fillDateFrom) {
        query = query.gte('date_filled', filter.fillDateFrom)
      }
      if (filter.fillDateTo) {
        query = query.lte('date_filled', filter.fillDateTo)
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapToBarrel)
  }

  async getBarrelById(id: string): Promise<Barrel | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || '').trim())

    if (isUuid) {
      const { data, error } = await this.supabase
        .from('tracking')
        .select('*')
        .eq('id', id) // Using UUID id as primary key
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(error.message)
      }

      return this.mapToBarrel(data)
    }

    const { data, error } = await this.supabase
      .from('tracking')
      .select('*')
      .eq('barrel_number', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return this.mapToBarrel(data)
  }

  private async resolveTrackingUuid(idOrBarrelNumber: string): Promise<string> {
    const raw = String(idOrBarrelNumber || '').trim()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
    if (isUuid) return raw

    const { data, error } = await this.supabase
      .from('tracking')
      .select('id')
      .eq('barrel_number', raw)
      .single()

    if (error) {
      throw new Error(error.message)
    }
    if (!data?.id) {
      throw new Error('Barrel not found')
    }
    return String(data.id)
  }

  async updateBarrel(id: string, data: UpdateBarrelData): Promise<Barrel> {
    const updateData: any = {}

    if (data.spiritType !== undefined) updateData.spirit = data.spiritType
    if (data.prevSpirit !== undefined) updateData.prev_spirit = data.prevSpirit
    if (data.barrelType !== undefined) updateData.barrel = data.barrelType
    if (data.fillDate !== undefined) updateData.date_filled = data.fillDate
    if (data.location !== undefined) updateData.location = data.location
    if (data.currentVolume !== undefined) updateData.volume = data.currentVolume.toString()
    if (data.abv !== undefined) updateData.abv = data.abv.toString()
    if (data.notes !== undefined) updateData.notes_comments = data.notes
    if (data.status !== undefined) updateData.status = data.status

    const resolvedId = await this.resolveTrackingUuid(id)

    const { data: barrel, error } = await this.supabase
      .from('tracking')
      .update(updateData)
      .eq('id', resolvedId) // Using UUID id as primary key
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToBarrel(barrel)
  }

  async deleteBarrel(id: string): Promise<void> {
    const resolvedId = await this.resolveTrackingUuid(id)

    const { error } = await this.supabase
      .from('tracking')
      .delete()
      .eq('id', resolvedId) // Using UUID id as primary key

    if (error) {
      throw new Error(error.message)
    }
  }

  async getBarrelStats(): Promise<BarrelStats> {
    const organizationId = await getOrganizationId()

    const { data: barrels, error } = await this.supabase.from('tracking').select('*')
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(error.message)
    }

    const stats: BarrelStats = {
      totalBarrels: barrels?.length || 0,
      activeBarrels: 0,
      totalVolume: 0,
      averageAge: 0,
      byStatus: {
        Aging: 0,
        Ready: 0,
        Emptied: 0,
        Maintenance: 0,
        Testing: 0,
      },
      bySpiritType: {},
      byLocation: {},
    }

    if (!barrels || barrels.length === 0) {
      return stats
    }

    let totalAge = 0
    const now = new Date()

    barrels.forEach((barrel) => {
      // Count by status
      const status = barrel.status || 'Aging'
      stats.byStatus[status as Barrel['status']]++

      // Active barrels (not emptied)
      if (status !== 'Emptied') {
        stats.activeBarrels++
      }

      // Total volume
      stats.totalVolume += parseFloat(barrel.volume) || 0

      // Average age
      if (barrel.date_filled) {
        const fillDate = new Date(barrel.date_filled)
        const ageInDays = Math.floor((now.getTime() - fillDate.getTime()) / (1000 * 60 * 60 * 24))
        totalAge += ageInDays
      }

      // By spirit type
      if (barrel.spirit) {
        stats.bySpiritType[barrel.spirit] = (stats.bySpiritType[barrel.spirit] || 0) + 1
      }

      // By location
      if (barrel.location) {
        stats.byLocation[barrel.location] = (stats.byLocation[barrel.location] || 0) + 1
      }
    })

    stats.averageAge = stats.totalBarrels > 0 ? Math.round(totalAge / stats.totalBarrels) : 0

    return stats
  }

  async moveBarrel(barrelId: string, toLocation: string, movedBy: string, notes?: string): Promise<BarrelMovement> {
    // Get current barrel location
    const barrel = await this.getBarrelById(barrelId)
    if (!barrel) {
      throw new Error('Barrel not found')
    }

    // Record the movement
    const { data: movement, error: movementError } = await this.supabase
      .from('barrel_movements')
      .insert({
        barrel_id: barrelId,
        from_location: barrel.location,
        to_location: toLocation,
        moved_by: movedBy,
        notes,
      })
      .select()
      .single()

    if (movementError) {
      throw new Error(movementError.message)
    }

    // Update barrel location
    await this.updateBarrel(barrelId, { location: toLocation })

    return {
      id: movement.id,
      barrelId: movement.barrel_id,
      fromLocation: movement.from_location,
      toLocation: movement.to_location,
      movedBy: movement.moved_by,
      movedAt: movement.moved_at,
      notes: movement.notes,
    }
  }

  async addSample(barrelId: string, sampleData: Omit<BarrelSample, 'id' | 'barrelId'>): Promise<BarrelSample> {
    // Update barrel volume
    const barrel = await this.getBarrelById(barrelId)
    if (!barrel) {
      throw new Error('Barrel not found')
    }

    const newVolume = barrel.currentVolume - sampleData.volume
    await this.updateBarrel(barrelId, { currentVolume: newVolume })

    // Record the sample
    const { data: sample, error } = await this.supabase
      .from('barrel_samples')
      .insert({
        barrel_id: barrelId,
        sample_date: sampleData.sampleDate,
        volume: sampleData.volume,
        abv: sampleData.abv,
        ph: sampleData.pH,
        temperature: sampleData.temperature,
        color: sampleData.color,
        aroma: sampleData.aroma,
        taste: sampleData.taste,
        notes: sampleData.notes,
        sampled_by: sampleData.sampledBy,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: sample.id,
      barrelId: sample.barrel_id,
      sampleDate: sample.sample_date,
      volume: sample.volume,
      abv: sample.abv,
      pH: sample.ph,
      temperature: sample.temperature,
      color: sample.color,
      aroma: sample.aroma,
      taste: sample.taste,
      notes: sample.notes,
      sampledBy: sample.sampled_by,
    }
  }

  private mapToBarrel(data: any): Barrel {
    const toNumOrNull = (v: any): number | null => {
      if (v === null || v === undefined) return null
      const raw = String(v).trim()
      if (!raw) return null
      const n = parseFloat(raw)
      return Number.isFinite(n) ? n : null
    }

    const original =
      typeof data.original_volume_l !== 'undefined' ? toNumOrNull(data.original_volume_l) :
      typeof data.original_volume !== 'undefined' ? toNumOrNull(data.original_volume) :
      typeof data.filled_liters !== 'undefined' ? toNumOrNull(data.filled_liters) :
      null

    return {
      id: data.id, // UUID primary key
      barrelNumber: data.barrel_number, // Human-readable barrel number
      spiritType: data.spirit || '',
      prevSpirit: data.prev_spirit,
      barrelType: data.barrel || '',
      barrelSize: '', // Not stored in current schema
      liters: parseFloat(data.volume) || 0,
      fillDate: normalizeDate(data.date_filled),
      location: data.location || '',
      status: data.status || 'Aging',
      currentVolume: parseFloat(data.volume) || 0,
      originalVolume: original,
      abv: parseFloat(data.abv) || 0,
      notes: data.notes_comments,
      batch: data.batch,
      dateMature: normalizeDate(data.date_mature),
      tastingNotes: data.tasting_notes,
      angelsShare: data.angelsshare,
      lastInspection: normalizeDate(data.last_inspection),
      organizationId: data.organization_id,
      createdBy: data.created_by ?? null,
      createdAt: normalizeDate(data.created_at) || data.created_at,
      updatedAt: normalizeDate(data.updated_at) || data.updated_at,
    }
  }
}

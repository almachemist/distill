import { createClient } from '@/lib/supabase/client'
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

export class BarrelService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  async createBarrel(data: CreateBarrelData): Promise<Barrel> {
    const { data: barrel, error } = await this.supabase
      .from('tracking')
      .insert({
        barrel_number: data.barrelNumber,
        spirit_type: data.spiritType,
        prev_spirit: data.prevSpirit,
        barrel_type: data.barrelType,
        barrel_size: data.barrelSize,
        liters: data.liters,
        fill_date: data.fillDate,
        location: data.location,
        current_volume: data.currentVolume,
        original_volume: data.originalVolume,
        abv: data.abv,
        notes: data.notes,
        status: 'Aging',
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToBarrel(barrel)
  }

  async getBarrels(filter?: BarrelFilter): Promise<Barrel[]> {
    let query = this.supabase.from('tracking').select('*')

    if (filter) {
      if (filter.status) {
        query = query.eq('status', filter.status)
      }
      if (filter.spiritType) {
        query = query.eq('spirit_type', filter.spiritType)
      }
      if (filter.location) {
        query = query.eq('location', filter.location)
      }
      if (filter.barrelType) {
        query = query.eq('barrel_type', filter.barrelType)
      }
      if (filter.fillDateFrom) {
        query = query.gte('fill_date', filter.fillDateFrom)
      }
      if (filter.fillDateTo) {
        query = query.lte('fill_date', filter.fillDateTo)
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(this.mapToBarrel)
  }

  async getBarrelById(id: string): Promise<Barrel | null> {
    const { data, error } = await this.supabase
      .from('tracking')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    return this.mapToBarrel(data)
  }

  async updateBarrel(id: string, data: UpdateBarrelData): Promise<Barrel> {
    const updateData: any = {}

    if (data.barrelNumber !== undefined) updateData.barrel_number = data.barrelNumber
    if (data.spiritType !== undefined) updateData.spirit_type = data.spiritType
    if (data.prevSpirit !== undefined) updateData.prev_spirit = data.prevSpirit
    if (data.barrelType !== undefined) updateData.barrel_type = data.barrelType
    if (data.barrelSize !== undefined) updateData.barrel_size = data.barrelSize
    if (data.liters !== undefined) updateData.liters = data.liters
    if (data.fillDate !== undefined) updateData.fill_date = data.fillDate
    if (data.location !== undefined) updateData.location = data.location
    if (data.currentVolume !== undefined) updateData.current_volume = data.currentVolume
    if (data.originalVolume !== undefined) updateData.original_volume = data.originalVolume
    if (data.abv !== undefined) updateData.abv = data.abv
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.status !== undefined) updateData.status = data.status

    const { data: barrel, error } = await this.supabase
      .from('tracking')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToBarrel(barrel)
  }

  async deleteBarrel(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tracking')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  async getBarrelStats(): Promise<BarrelStats> {
    const { data: barrels, error } = await this.supabase
      .from('tracking')
      .select('*')

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
      stats.byStatus[barrel.status as Barrel['status']]++

      // Active barrels (not emptied)
      if (barrel.status !== 'Emptied') {
        stats.activeBarrels++
      }

      // Total volume
      stats.totalVolume += barrel.current_volume || 0

      // Average age
      if (barrel.fill_date) {
        const fillDate = new Date(barrel.fill_date)
        const ageInDays = Math.floor((now.getTime() - fillDate.getTime()) / (1000 * 60 * 60 * 24))
        totalAge += ageInDays
      }

      // By spirit type
      if (barrel.spirit_type) {
        stats.bySpiritType[barrel.spirit_type] = (stats.bySpiritType[barrel.spirit_type] || 0) + 1
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
    return {
      id: data.id,
      barrelNumber: data.barrel_number,
      spiritType: data.spirit_type,
      prevSpirit: data.prev_spirit,
      barrelType: data.barrel_type,
      barrelSize: data.barrel_size,
      liters: data.liters,
      fillDate: data.fill_date,
      location: data.location,
      status: data.status,
      currentVolume: data.current_volume,
      originalVolume: data.original_volume,
      abv: data.abv,
      notes: data.notes,
      organizationId: data.organization_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}
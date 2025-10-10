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
    // In development mode, use mock organization ID
    let organizationId = '00000000-0000-0000-0000-000000000001'
    
    if (process.env.NODE_ENV !== 'development') {
      // Get the user's organization ID
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('User has no organization')
      }
      
      organizationId = profile.organization_id
    }

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
    // In development mode, use mock organization ID
    let organizationId = '00000000-0000-0000-0000-000000000001'
    
    if (process.env.NODE_ENV !== 'development') {
      // Get the user's organization ID
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('User has no organization')
      }
      
      organizationId = profile.organization_id
    }

    let query = this.supabase.from('tracking').select('*').eq('organization_id', organizationId)

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

    const { data: barrel, error } = await this.supabase
      .from('tracking')
      .update(updateData)
      .eq('id', id) // Using UUID id as primary key
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
      .eq('id', id) // Using UUID id as primary key

    if (error) {
      throw new Error(error.message)
    }
  }

  async getBarrelStats(): Promise<BarrelStats> {
    // In development mode, use mock organization ID
    let organizationId = '00000000-0000-0000-0000-000000000001'
    
    if (process.env.NODE_ENV !== 'development') {
      // Get the user's organization ID
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('User has no organization')
      }
      
      organizationId = profile.organization_id
    }

    const { data: barrels, error } = await this.supabase
      .from('tracking')
      .select('*')
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
    return {
      id: data.id, // UUID primary key
      barrelNumber: data.barrel_number, // Human-readable barrel number
      spiritType: data.spirit || '',
      prevSpirit: data.prev_spirit,
      barrelType: data.barrel || '',
      barrelSize: '', // Not stored in current schema
      liters: parseFloat(data.volume) || 0,
      fillDate: data.date_filled,
      location: data.location || '',
      status: data.status || 'Aging',
      currentVolume: parseFloat(data.volume) || 0,
      originalVolume: parseFloat(data.volume) || 0,
      abv: parseFloat(data.abv) || 0,
      notes: data.notes_comments,
      organizationId: data.organization_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}
import { createClient } from '@/lib/supabase/client'
import type { RumProductionRunDB } from '../types/rum-production.types'

export class RumProductionRepository {
  private supabase = createClient()

  /**
   * Create a new rum production run
   */
  async create(data: Partial<RumProductionRunDB>): Promise<RumProductionRunDB> {
    const { data: result, error } = await this.supabase
      .from('rum_production_runs')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating rum production run:', error)
      throw error
    }

    return result
  }

  /**
   * Get all rum production runs
   */
  async getAll(): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .order('fermentation_start_date', { ascending: false })

    if (error) {
      console.error('Error fetching rum production runs:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get a single rum production run by batch_id
   */
  async getByBatchId(batchId: string): Promise<RumProductionRunDB | null> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .eq('batch_id', batchId)
      .single()

    if (error) {
      console.error('Error fetching rum production run:', error)
      return null
    }

    return data
  }

  /**
   * Get rum production runs by cask number
   */
  async getByCaskNumber(caskNumber: string): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .eq('cask_number', caskNumber)
      .order('fill_date', { ascending: false })

    if (error) {
      console.error('Error fetching rum production runs by cask:', error)
      throw error
    }

    return data || []
  }

  /**
   * Update a rum production run
   */
  async update(
    batchId: string,
    updates: Partial<RumProductionRunDB>
  ): Promise<RumProductionRunDB> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('batch_id', batchId)
      .select()
      .single()

    if (error) {
      console.error('Error updating rum production run:', error)
      throw error
    }

    return data
  }

  /**
   * Delete a rum production run
   */
  async delete(batchId: string): Promise<void> {
    const { error } = await this.supabase
      .from('rum_production_runs')
      .delete()
      .eq('batch_id', batchId)

    if (error) {
      console.error('Error deleting rum production run:', error)
      throw error
    }
  }

  /**
   * Get production runs within a date range
   */
  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .gte('fermentation_start_date', startDate)
      .lte('fermentation_start_date', endDate)
      .order('fermentation_start_date', { ascending: false })

    if (error) {
      console.error('Error fetching rum production runs by date range:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get rum production runs by product type
   */
  async getByProductType(
    productType: 'rum' | 'cane_spirit'
  ): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .eq('product_type', productType)
      .order('fermentation_start_date', { ascending: false })

    if (error) {
      console.error('Error fetching rum production runs by type:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get runs that are currently in fermentation (no distillation date yet)
   */
  async getInFermentation(): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .is('distillation_date', null)
      .not('fermentation_start_date', 'is', null)
      .order('fermentation_start_date', { ascending: false })

    if (error) {
      console.error('Error fetching fermentation runs:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get runs that are distilled but not casked yet
   */
  async getDistilledNotCasked(): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .not('distillation_date', 'is', null)
      .is('fill_date', null)
      .order('distillation_date', { ascending: false })

    if (error) {
      console.error('Error fetching distilled runs:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get complete production runs (fermented, distilled, and casked)
   */
  async getComplete(): Promise<RumProductionRunDB[]> {
    const { data, error } = await this.supabase
      .from('rum_production_runs')
      .select('*')
      .not('fermentation_start_date', 'is', null)
      .not('distillation_date', 'is', null)
      .not('fill_date', 'is', null)
      .order('fill_date', { ascending: false })

    if (error) {
      console.error('Error fetching complete runs:', error)
      throw error
    }

    return data || []
  }
}




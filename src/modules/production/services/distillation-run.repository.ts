import { createClient } from '@/lib/supabase/client'

export type DistillationRunInput = {
  batchId: string
  sku: string
  displayName: string
  productId?: string
  recipeId?: string
  date: string
  stillUsed: string
  
  // Charge
  chargeComponents: any[]
  chargeTotalVolume?: number
  chargeTotalABV?: number
  chargeTotalLAL?: number
  
  // Botanicals (optional)
  botanicals?: any[]
  steepingStartTime?: string
  steepingEndTime?: string
  steepingTemp?: number
  
  // Heating
  boilerOnTime?: string
  powerSetting?: string
  heatingElements?: string
  plates?: string
  deflegmator?: string
  
  // Cuts
  foreshotsVolume?: number
  foreshotsABV?: number
  foreshotsLAL?: number
  
  headsVolume?: number
  headsABV?: number
  headsLAL?: number
  
  heartsVolume?: number
  heartsABV?: number
  heartsLAL?: number
  
  tailsVolume?: number
  tailsABV?: number
  tailsLAL?: number
  
  heartsSegments?: any[]
  tailsSegments?: any[]
  
  // Dilution
  dilutionSteps?: any[]
  finalOutputVolume?: number
  finalOutputABV?: number
  finalOutputLAL?: number
  
  notes?: string
}

export class DistillationRunRepository {
  private supabase = createClient()

  async create(data: DistillationRunInput) {
    console.log('💾 Saving distillation run to Supabase:', data.batchId)
    
    const { data: result, error } = await this.supabase
      .from('distillation_runs')
      .insert([{
        batch_id: data.batchId,
        sku: data.sku,
        display_name: data.displayName,
        product_id: data.productId,
        recipe_id: data.recipeId,
        date: data.date,
        still_used: data.stillUsed,
        
        // Charge
        charge_components: data.chargeComponents,
        charge_total_volume_l: data.chargeTotalVolume,
        charge_total_abv_percent: data.chargeTotalABV,
        charge_total_lal: data.chargeTotalLAL,
        
        // Botanicals
        botanicals: data.botanicals,
        steeping_start_time: data.steepingStartTime,
        steeping_end_time: data.steepingEndTime,
        steeping_temp_c: data.steepingTemp,
        
        // Heating
        boiler_on_time: data.boilerOnTime,
        power_setting: data.powerSetting,
        heating_elements: data.heatingElements,
        plates: data.plates,
        deflegmator: data.deflegmator,
        
        // Cuts
        foreshots_volume_l: data.foreshotsVolume,
        foreshots_abv_percent: data.foreshotsABV,
        foreshots_lal: data.foreshotsLAL,
        
        heads_volume_l: data.headsVolume,
        heads_abv_percent: data.headsABV,
        heads_lal: data.headsLAL,
        
        hearts_volume_l: data.heartsVolume,
        hearts_abv_percent: data.heartsABV,
        hearts_lal: data.heartsLAL,
        
        tails_volume_l: data.tailsVolume,
        tails_abv_percent: data.tailsABV,
        tails_lal: data.tailsLAL,
        
        hearts_segments: data.heartsSegments,
        tails_segments: data.tailsSegments,
        
        // Dilution
        dilution_steps: data.dilutionSteps,
        final_output_volume_l: data.finalOutputVolume,
        final_output_abv_percent: data.finalOutputABV,
        final_output_lal: data.finalOutputLAL,
        
        notes: data.notes
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Error saving distillation run:', error)
      throw error
    }

    console.log('✅ Distillation run saved successfully:', result?.id)
    return result
  }

  async getAll() {
    const { data, error } = await this.supabase
      .from('distillation_runs')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('❌ Error fetching distillation runs:', error)
      throw error
    }

    return data || []
  }

  async getByBatchId(batchId: string) {
    const { data, error } = await this.supabase
      .from('distillation_runs')
      .select('*')
      .eq('batch_id', batchId)
      .single()

    if (error) {
      console.error(`❌ Error fetching batch ${batchId}:`, error)
      return null
    }

    return data
  }

  async update(batchId: string, data: Partial<DistillationRunInput>) {
    const { data: result, error } = await this.supabase
      .from('distillation_runs')
      .update({
        // Map the input data to database columns
        ...(data.displayName && { display_name: data.displayName }),
        ...(data.stillUsed && { still_used: data.stillUsed }),
        ...(data.chargeComponents && { charge_components: data.chargeComponents }),
        ...(data.chargeTotalVolume !== undefined && { charge_total_volume_l: data.chargeTotalVolume }),
        ...(data.chargeTotalABV !== undefined && { charge_total_abv_percent: data.chargeTotalABV }),
        ...(data.chargeTotalLAL !== undefined && { charge_total_lal: data.chargeTotalLAL }),
        // ... add other fields as needed
        updated_at: new Date().toISOString()
      })
      .eq('batch_id', batchId)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error updating batch ${batchId}:`, error)
      throw error
    }

    return result
  }

  async delete(batchId: string) {
    const { error } = await this.supabase
      .from('distillation_runs')
      .delete()
      .eq('batch_id', batchId)

    if (error) {
      console.error(`❌ Error deleting batch ${batchId}:`, error)
      throw error
    }

    console.log(`🗑️ Batch ${batchId} deleted successfully`)
  }
}





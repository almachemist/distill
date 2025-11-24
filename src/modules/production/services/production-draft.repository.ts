/**
 * PRODUCTION DRAFT REPOSITORY
 * 
 * Manages draft production batches in Supabase.
 * Handles creation, updating, and finalization of production batches.
 */

import { createClient } from '@/lib/supabase/client';
import {
  ProductionBatch,
  GinVodkaSpiritBatch,
  RumCaneSpiritBatch,
  ProductType,
  ProductionStatus,
  isGinVodkaSpiritBatch,
  isRumCaneSpiritBatch,
} from '@/types/production-schemas';
import { createProductionTemplate } from '@/lib/production-templates';
import type { Recipe, GinVodkaSpiritRecipe, isGinVodkaSpiritRecipe } from '@/types/recipe-schemas';

const supabase = createClient();

// ============================================================================
// DRAFT MANAGEMENT
// ============================================================================

/**
 * Create a new draft production batch
 */
export async function createDraftBatch(
  productType: ProductType,
  recipe?: Recipe
): Promise<ProductionBatch | null> {
  try {
    const template = createProductionTemplate(productType);

    // Merge recipe data into template if provided
    if (recipe && 'botanicals' in recipe) {
      const ginRecipe = recipe as GinVodkaSpiritRecipe;
      const ginTemplate = template as Partial<GinVodkaSpiritBatch>;

      // Pre-fill botanicals from recipe
      if (ginRecipe.botanicals && ginRecipe.botanicals.length > 0) {
        ginTemplate.botanicals = ginRecipe.botanicals.map(b => ({
          name: b.name,
          weight_g: b.weight_g,
          ratio_percent: b.ratio_percent || 0,
          notes: b.notes || '',
        }));
      }

      // Pre-fill still setup from recipe
      if (ginRecipe.recommendedStill) {
        ginTemplate.stillUsed = ginRecipe.recommendedStill;
      }
      if (ginRecipe.elements) {
        ginTemplate.stillSetup = {
          ...ginTemplate.stillSetup,
          elements: ginRecipe.elements,
        };
      }
      if (ginRecipe.plates) {
        ginTemplate.stillSetup = {
          ...ginTemplate.stillSetup,
          plates: ginRecipe.plates,
        };
      }
      if (ginRecipe.steepingHours) {
        ginTemplate.stillSetup = {
          ...ginTemplate.stillSetup,
          steeping: `Juniper steeped ${ginRecipe.steepingHours} hrs`,
        };
      }

      // Pre-fill target ABV
      if (ginRecipe.targetFinalABV_percent) {
        ginTemplate.targetFinalABV = ginRecipe.targetFinalABV_percent;
      }

      // Store recipe reference
      ginTemplate.recipeName = recipe.recipeName;
      ginTemplate.recipeId = recipe.id;
    }

    // Determine which table to use
    if (productType === 'rum' || productType === 'cane_spirit') {
      // Generate a unique batch_id if not provided
      const batchId = template.batch_id || `DRAFT-${productType.toUpperCase()}-${Date.now()}`;
      const productName = template.product_name || (productType === 'rum' ? 'Rum' : 'Cane Spirit');

      // Prepare the insert data - only include fields that exist in the database
      const insertData = {
        batch_id: batchId,
        product_name: productName,
        product_type: productType,
        status: 'draft',
        overall_status: 'draft',
        fermentation_status: 'not_started',
        distillation_status: 'not_started',
        aging_status: 'not_started',
        bottling_status: 'not_started',
        still_used: template.still_used || 'Roberta',
        notes: template.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into rum_production_runs
      const { data, error } = await supabase
        .from('rum_production_runs')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating rum draft:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          insertData
        });
        return null;
      }

      return data as RumCaneSpiritBatch;
    } else {
      // Insert into production_batches
      const { data, error } = await supabase
        .from('production_batches')
        .insert({
          id: template.spiritRunId || `DRAFT-${Date.now()}`,
          type: productType,
          still: (template as Partial<GinVodkaSpiritBatch>).stillUsed || '',
          data: {
            ...template,
            status: 'draft',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating gin/vodka draft:', error);
        return null;
      }

      return {
        ...data.data,
        id: data.id,
      } as GinVodkaSpiritBatch;
    }
  } catch (error) {
    console.error('Error in createDraftBatch:', error);
    return null;
  }
}

/**
 * Get all draft batches
 */
export async function getDraftBatches(): Promise<ProductionBatch[]> {
  try {
    const batches: ProductionBatch[] = [];
    
    // Get gin/vodka drafts from production_batches
    const { data: ginVodkaData, error: ginVodkaError } = await supabase
      .from('production_batches')
      .select('*')
      .eq('data->>status', 'draft');
    
    if (!ginVodkaError && ginVodkaData) {
      batches.push(...ginVodkaData.map(batch => ({
        ...batch.data,
        id: batch.id,
      })));
    }
    
    // Get rum drafts from rum_production_runs
    // Note: rum_production_runs doesn't have a status column yet
    // We'll need to add it in a migration
    
    return batches;
  } catch (error) {
    console.error('Error in getDraftBatches:', error);
    return [];
  }
}

/**
 * Get a specific draft batch by ID (tries both tables if productType not specified)
 */
export async function getDraftBatch(id: string, productType?: ProductType): Promise<ProductionBatch | null> {
  try {
    console.log('getDraftBatch called with:', { id, productType });

    // If productType is specified, use it
    if (productType === 'rum' || productType === 'cane_spirit') {
      const { data, error } = await supabase
        .from('rum_production_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error getting rum draft:', {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          id,
          productType
        });
        return null;
      }

      return data as RumCaneSpiritBatch;
    } else if (productType && productType !== 'rum' && productType !== 'cane_spirit') {
      // Gin, vodka, liqueur, other
      const { data, error } = await supabase
        .from('production_batches')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error getting gin/vodka draft:', {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          id,
          productType,
          dataExists: !!data
        });
        return null;
      }

      return {
        ...data.data,
        id: data.id,
      } as GinVodkaSpiritBatch;
    } else {
      // Product type not specified - try both tables
      // First try production_batches (gin/vodka)
      const { data: ginData, error: ginError } = await supabase
        .from('production_batches')
        .select('*')
        .eq('id', id)
        .single();

      if (!ginError && ginData) {
        return {
          ...ginData.data,
          id: ginData.id,
        } as GinVodkaSpiritBatch;
      }

      // Then try rum_production_runs
      const { data: rumData, error: rumError } = await supabase
        .from('rum_production_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (!rumError && rumData) {
        return rumData as RumCaneSpiritBatch;
      }

      // Not found in either table
      console.error('Batch not found in any table:', {
        id,
        ginError,
        rumError
      });
      return null;
    }
  } catch (error) {
    console.error('Error in getDraftBatch:', error);
    return null;
  }
}

/**
 * Update a draft batch
 */
export async function updateDraftBatch(
  id: string,
  updates: Partial<ProductionBatch>,
  productType?: ProductType
): Promise<ProductionBatch | null> {
  try {
    console.log('updateDraftBatch called with:', { id, productType, hasUpdates: !!updates });

    const updatedData = {
      ...updates,
      lastEditedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Determine which table to use
    const isRum = productType === 'rum' ||
                  productType === 'cane_spirit' ||
                  isRumCaneSpiritBatch(updates as ProductionBatch);

    if (isRum) {
      // Update rum_production_runs table
      const { data, error } = await supabase
        .from('rum_production_runs')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rum draft:', {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          id,
          productType,
          updateKeys: Object.keys(updatedData)
        });
        return null;
      }

      return data as RumCaneSpiritBatch;
    } else {
      // Update production_batches table (gin/vodka/other)
      const { data, error } = await supabase
        .from('production_batches')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating gin/vodka draft:', {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          id,
          productType,
          updateKeys: Object.keys(updatedData),
          dataExists: !!data
        });
        return null;
      }

      return {
        ...data.data,
        id: data.id,
      } as GinVodkaSpiritBatch;
    }
  } catch (error) {
    console.error('Error in updateDraftBatch:', error);
    return null;
  }
}

/**
 * Finalize a draft batch (change status to completed)
 */
export async function finalizeDraftBatch(
  id: string,
  productType: ProductType
): Promise<ProductionBatch | null> {
  try {
    return await updateDraftBatch(id, {
      status: 'completed',
    } as Partial<ProductionBatch>, productType);
  } catch (error) {
    console.error('Error in finalizeDraftBatch:', error);
    return null;
  }
}

/**
 * Delete a draft batch
 */
export async function deleteDraftBatch(id: string, productType: ProductType): Promise<boolean> {
  try {
    if (productType === 'rum' || productType === 'cane_spirit') {
      const { error } = await supabase
        .from('rum_production_runs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting rum draft:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('production_batches')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting gin/vodka draft:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteDraftBatch:', error);
    return false;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate if a batch is ready to be finalized
 */
export function validateBatchForFinalization(batch: ProductionBatch): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (isGinVodkaSpiritBatch(batch)) {
    if (!batch.spiritRunId) errors.push('Spirit Run ID is required');
    if (!batch.sku) errors.push('Product name (SKU) is required');
    if (!batch.date) errors.push('Production date is required');
    if (!batch.stillUsed) errors.push('Still used is required');

    // Check charge volume from components array
    const chargeVolume = (batch.chargeAdjustment?.components ?? []).reduce((sum, c) => sum + (c.volume_L ?? 0), 0);
    if (chargeVolume === 0) errors.push('Charge volume is required (add components in Charge Adjustment section)');

    if (!batch.output || batch.output.length === 0) errors.push('At least one output fraction is required');
  } else if (isRumCaneSpiritBatch(batch)) {
    if (!batch.batch_id) errors.push('Batch ID is required');
    if (!batch.fermentation_start_date) errors.push('Fermentation start date is required');
    if (!batch.distillation_date) errors.push('Distillation date is required');
    if (!batch.boiler_volume_l) errors.push('Boiler volume is required');
    if (!batch.hearts_volume_l) errors.push('Hearts volume is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


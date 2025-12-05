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
  StillSetup,
} from '@/types/production-schemas';
import { createProductionTemplate } from '@/lib/production-templates';
import type { Recipe, GinVodkaSpiritRecipe, isGinVodkaSpiritRecipe } from '@/types/recipe-schemas';

async function getSupabase() {
  const mod = await import('@/lib/supabase/client');
  return mod.createClient();
}

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
      const getCurrentStillSetup = (): StillSetup => ({
        elements: ginTemplate.stillSetup?.elements ?? '',
        plates: ginTemplate.stillSetup?.plates ?? '',
        steeping: ginTemplate.stillSetup?.steeping ?? '',
        options: ginTemplate.stillSetup?.options
      })
      if (ginRecipe.elements) {
        const current = getCurrentStillSetup();
        ginTemplate.stillSetup = { ...current, elements: ginRecipe.elements };
      }
      if (ginRecipe.plates) {
        const current = getCurrentStillSetup();
        ginTemplate.stillSetup = { ...current, plates: ginRecipe.plates };
      }
      if (ginRecipe.steepingHours) {
        const current = getCurrentStillSetup();
        ginTemplate.stillSetup = { ...current, steeping: `Juniper steeped ${ginRecipe.steepingHours} hrs` };
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
      const rumTemplate = template as Partial<RumCaneSpiritBatch>
      // Generate a unique batch_id if not provided
      const batchId = rumTemplate.batch_name || `DRAFT-${productType.toUpperCase()}-${Date.now()}`;
      const productName = rumTemplate.product_name || (productType === 'rum' ? 'Rum' : 'Cane Spirit');

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
        still_used: rumTemplate.still_used || 'Roberta',
        notes: rumTemplate.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into rum_production_runs
      const sb = await getSupabase();
      const { data, error } = await sb
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
      const ginTemplate = template as Partial<GinVodkaSpiritBatch>
      // Insert into production_batches
      const sb = await getSupabase();
      const { data, error } = await sb
        .from('production_batches')
        .insert({
          id: ginTemplate.spiritRunId || `DRAFT-${Date.now()}`,
          type: productType,
          still: ginTemplate.stillUsed || '',
          data: {
            ...ginTemplate,
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
    const sb = await getSupabase();
    const { data: ginVodkaData, error: ginVodkaError } = await sb
      .from('production_batches')
      .select('*')
      .eq('data->>status', 'draft');
    
    if (!ginVodkaError && ginVodkaData) {
      batches.push(...ginVodkaData.map((batch: any) => ({
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
    console.log('🔍 getDraftBatch called with:', { id, productType });

    // Auto-detect table based on ID format
    // UUID = rum_production_runs, TEXT = production_batches
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    console.log('🔍 ID format detection:', {
      id,
      isUUID,
      willUseTable: isUUID ? 'rum_production_runs' : 'production_batches'
    });

    if (isUUID) {
      // UUID = rum_production_runs table
      const sb = await getSupabase();
      const { data, error } = await sb
        .from('rum_production_runs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('❌ Error getting rum draft:', {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          id
        });
        return null;
      }

      console.log('✅ Found rum batch');
      return data as RumCaneSpiritBatch;
    } else {
      // TEXT id = production_batches table
      const sb = await getSupabase();
      const { data, error } = await sb
        .from('production_batches')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('❌ Error getting gin/vodka draft:', {
          error,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          id
        });
        return null;
      }

      console.log('✅ Found gin/vodka batch');
      return {
        ...data.data,
        id: data.id,
      } as GinVodkaSpiritBatch;
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
    console.log('🔄 updateDraftBatch called with:', { id, productType, hasUpdates: !!updates });

    // Determine which table to use
    // First, try to determine from productType parameter or type guard
    let isRum = productType === 'rum' ||
                productType === 'cane_spirit' ||
                isRumCaneSpiritBatch(updates as ProductionBatch);

    // If we're not sure, try to detect by checking which table has this ID
    if (!productType) {
      console.log('🔍 No productType provided, checking which table contains this batch...');

      // Check rum table first
      const sbDetect = await getSupabase();
      const { data: rumCheck } = await sbDetect
        .from('rum_production_runs')
        .select('id')
        .eq('id', id)
        .single();

      if (rumCheck) {
        console.log('✅ Found batch in rum_production_runs table');
        isRum = true;
      } else {
        console.log('✅ Batch not in rum table, assuming production_batches table');
        isRum = false;
      }
    }

    if (isRum) {
      // Update rum_production_runs table
      // Note: rum_production_runs doesn't have 'lastEditedAt' column
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Remove fields that don't exist in rum_production_runs
      delete (updatedData as any).lastEditedAt;
      delete (updatedData as any).id; // Don't update primary key

      const sbRumUpd = await getSupabase();
      const { data, error } = await sbRumUpd
        .from('rum_production_runs')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ ERROR updating rum draft:');
        console.error('Full error object:', error);
        console.error('Error keys:', Object.keys(error));
        console.error('Error message:', error?.message);
        console.error('Error details:', error?.details);
        console.error('Error hint:', error?.hint);
        console.error('Error code:', error?.code);
        console.error('Batch ID:', id);
        console.error('Update keys:', Object.keys(updatedData));
        console.error('Update data sample:', JSON.stringify(updatedData).substring(0, 500));

        // Log all error properties
        for (const key in error) {
          console.error(`error.${key}:`, (error as any)[key]);
        }

        return null;
      }

      return data as RumCaneSpiritBatch;
    } else {
      // Update production_batches table (gin/vodka/other)
      // Note: production_batches table has columns: id, data (JSONB), type, still, created_at, updated_at
      // Both 'type' and 'still' are NOT NULL columns, so we must provide them

      // For production_batches, we can include lastEditedAt in the JSONB data
      const updatedData = {
        ...updates,
        lastEditedAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Remove id to avoid updating primary key
      delete (updatedData as any).id;

      // First, get the existing record to get current type and still values
      const sbFetch = await getSupabase();
      const { data: existingData, error: fetchError } = await sbFetch
        .from('production_batches')
        .select('type, still')
        .eq('id', id)
        .single();

      if (fetchError || !existingData) {
        console.error('❌ Error fetching existing batch for update:', {
          '🔴 ERROR': fetchError,
          '📝 Error Message': fetchError?.message,
          '📋 Error Details': fetchError?.details,
          '💡 Error Hint': fetchError?.hint,
          '🔢 Error Code': fetchError?.code,
          '🆔 Batch ID': id,
          '💭 Possible Cause': 'Batch not found in production_batches table. It might be in rum_production_runs table instead.'
        });

        // Try to be helpful
        console.log('💡 TIP: If this is a rum/cane spirit batch, make sure productType is set correctly');

        return null;
      }

      console.log('📋 Existing batch data:', existingData);

      const updatePayload: any = {
        data: updatedData,
        // type and still are NOT NULL, so we must always provide them
        type: updatedData.productType || existingData.type || 'gin',
        still: (updatedData as Partial<GinVodkaSpiritBatch>).stillUsed || existingData.still || '',
        updated_at: new Date().toISOString(),
      };

      console.log('📤 Update payload:', {
        id,
        type: updatePayload.type,
        still: updatePayload.still,
        dataKeys: Object.keys(updatedData),
        dataSample: JSON.stringify(updatedData).substring(0, 300)
      });

      const sbUpd = await getSupabase();
      const { data, error } = await sbUpd
        .from('production_batches')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ ERROR updating gin/vodka draft:', {
          '🔴 ERROR OBJECT': error,
          '📝 Error Message': error?.message,
          '📋 Error Details': error?.details,
          '💡 Error Hint': error?.hint,
          '🔢 Error Code': error?.code,
          '🆔 Batch ID': id,
          '🏷️ Product Type': productType,
          '🔑 Update Keys': Object.keys(updatedData),
          '📦 Update Payload': updatePayload,
          '✅ Data Exists': !!data
        });

        // Also log as plain text for easy copying
        console.error('ERROR DETAILS (plain text):');
        console.error('Message:', error?.message);
        console.error('Details:', error?.details);
        console.error('Hint:', error?.hint);
        console.error('Code:', error?.code);

        return null;
      }

      console.log('✅ Successfully updated gin/vodka draft');

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
      const sbDel = await getSupabase();
      const { error } = await sbDel
        .from('rum_production_runs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting rum draft:', error);
        return false;
      }
    } else {
      const sbDel = await getSupabase();
      const { error } = await sbDel
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
    if (!batch.batch_name) errors.push('Batch name is required');
    if (!batch.fermentation_date) errors.push('Fermentation date is required');
    if (!batch.distillation_date) errors.push('Distillation date is required');
    if (!batch.boiler_volume_l) errors.push('Boiler volume is required');
    if (!batch.hearts_volume_l) errors.push('Hearts volume is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

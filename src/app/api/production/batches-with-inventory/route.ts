import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryIntegrationService } from '@/modules/production/services/inventory-integration.service'
import { EthanolSelection } from '@/modules/production/components/EthanolBatchSelector'
import { BotanicalSelection } from '@/modules/production/components/BotanicalSelector'
import { PackagingSelection } from '@/modules/production/components/PackagingSelector'

export interface BatchWithInventoryInput {
  // Batch basic info
  batch_id: string
  batch_type: 'gin' | 'vodka' | 'rum' | 'cane_spirit'
  product_name: string
  date: string
  still_used?: string
  notes?: string
  
  // Inventory selections
  ethanol?: EthanolSelection
  water_quantity_l?: number
  botanicals?: BotanicalSelection[]
  packaging?: PackagingSelection[]
  
  // User info
  created_by: string
  organization_id: string
}

/**
 * POST /api/production/batches-with-inventory
 * 
 * Creates a new production batch and automatically:
 * 1. Saves batch materials (ethanol, water)
 * 2. Saves batch botanicals
 * 3. Saves batch packaging
 * 4. Deducts quantities from inventory (FIFO)
 * 5. Creates inventory movement records
 * 6. Calculates and saves batch costs
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const input: BatchWithInventoryInput = await request.json()

    // Validate required fields
    if (!input.batch_id || !input.batch_type || !input.organization_id || !input.created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: batch_id, batch_type, organization_id, created_by' },
        { status: 400 }
      )
    }

    // Validate ethanol selection
    if (!input.ethanol || !input.ethanol.inventory_item_id) {
      return NextResponse.json(
        { error: 'Ethanol selection is required' },
        { status: 400 }
      )
    }

    const inventoryService = new InventoryIntegrationService()

    // 1. Save batch materials (ethanol + water)
    const materialsResult = await inventoryService.saveBatchMaterials({
      organization_id: input.organization_id,
      batch_id: input.batch_id,
      batch_type: input.batch_type,
      ethanol: input.ethanol,
      water_quantity_l: input.water_quantity_l,
      created_by: input.created_by
    })

    if (!materialsResult.success) {
      return NextResponse.json(
        { error: `Failed to save batch materials: ${materialsResult.error}` },
        { status: 500 }
      )
    }

    // 2. Save batch botanicals (if any)
    if (input.botanicals && input.botanicals.length > 0) {
      const botanicalsResult = await inventoryService.saveBatchBotanicals({
        organization_id: input.organization_id,
        batch_id: input.batch_id,
        batch_type: input.batch_type,
        botanicals: input.botanicals,
        created_by: input.created_by
      })

      if (!botanicalsResult.success) {
        return NextResponse.json(
          { error: `Failed to save batch botanicals: ${botanicalsResult.error}` },
          { status: 500 }
        )
      }
    }

    // 3. Save batch packaging (if any)
    if (input.packaging && input.packaging.length > 0) {
      const packagingResult = await inventoryService.saveBatchPackaging({
        organization_id: input.organization_id,
        batch_id: input.batch_id,
        batch_type: input.batch_type,
        packaging: input.packaging,
        created_by: input.created_by
      })

      if (!packagingResult.success) {
        return NextResponse.json(
          { error: `Failed to save batch packaging: ${packagingResult.error}` },
          { status: 500 }
        )
      }
    }

    // 4. Calculate and save batch costs
    const costsResult = await inventoryService.calculateBatchCosts(
      input.organization_id,
      input.batch_id,
      input.batch_type
    )

    if (!costsResult.success) {
      console.error('Failed to calculate batch costs:', costsResult.error)
      // Don't fail the whole request, just log the error
    }

    // 5. Return success with cost information
    return NextResponse.json({
      success: true,
      batch_id: input.batch_id,
      total_cost: costsResult.total_cost,
      message: 'Batch created successfully with inventory integration'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error in POST /api/production/batches-with-inventory:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


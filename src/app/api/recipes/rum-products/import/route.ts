/**
 * API Route: Import Rum Product Recipes
 * POST /api/recipes/rum-products/import
 * 
 * Seeds rum product recipes (Pineapple, Spiced, Dark) into Supabase
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RumProductSeedService } from '@/modules/recipes/services/rum-product-seed.service'

export async function POST() {
  try {
    const supabase = await createClient()
    const seedService = new RumProductSeedService(supabase)
    const result = await seedService.seedAllRumProductRecipes()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        count: result.count
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        count: result.count
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error importing rum product recipes:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      count: 0
    }, { status: 500 })
  }
}


/**
 * RECIPE SCHEMAS
 * 
 * Recipes are reusable templates that define the base parameters
 * for producing a specific product (e.g., Rainforest Gin, Navy Strength Rum).
 * 
 * When creating a new production batch, the user selects a recipe,
 * and the system creates a draft with the recipe data as a starting point.
 */

import type { ProductType } from '@/types/production-schemas'

// ============================================================================
// BASE RECIPE TYPE
// ============================================================================

export interface BaseRecipe {
  id?: string
  recipeName: string
  productType: ProductType
  description?: string
  notes?: string
  createdAt: string
  updatedAt: string
  isActive: boolean // Can be used to archive old recipes
}

// ============================================================================
// GIN / VODKA / SPIRIT RECIPE
// ============================================================================

export interface RecipeBotanical {
  name: string
  weight_g: number
  ratio_percent?: number
  phase?: 'steep' | 'vapor' | 'both'
  notes?: string
}

export interface GinVodkaSpiritRecipe extends BaseRecipe {
  productType: 'gin' | 'vodka' | 'other'
  
  // Base Spirit
  baseSpirit: string // e.g., "Ethanol 96%", "Manildra NC96"
  targetChargeVolume_L?: number
  targetChargeABV_percent?: number
  
  // Botanicals (for gin)
  botanicals?: RecipeBotanical[]
  totalBotanicals_g?: number
  botanicalsPerLAL?: number
  
  // Still Configuration
  recommendedStill?: string // e.g., "Carrie", "Roberta"
  steepingHours?: number
  elements?: string
  plates?: string
  helmetType?: string
  
  // Target Output
  targetHearts_L?: number
  targetFinalABV_percent?: number
  
  // Process Notes
  distillationNotes?: string
  cutPoints?: {
    foreshots_notes?: string
    heads_notes?: string
    hearts_notes?: string
    tails_notes?: string
  }
}

// ============================================================================
// RUM / CANE SPIRIT RECIPE
// ============================================================================

export interface RumCaneSpiritRecipe extends BaseRecipe {
  productType: 'rum' | 'cane_spirit'
  
  // Fermentation
  substrateType: string // e.g., "A Molasses", "Cane Juice", "Mixed"
  targetSubstrateMass_kg?: number
  targetWaterMass_kg?: number
  targetInitialBrix?: number
  targetInitialPH?: number
  
  // Dunder
  dunderRecommended?: boolean
  dunderType?: string
  dunderVolume_L?: number
  
  // Yeast
  yeastType: string // e.g., "Distillamax CN", "Wild fermentation"
  yeastMass_g?: number
  yeastRehydrationTemp_C?: number
  yeastRehydrationTime_min?: number
  
  // Additives
  antifoam_ml?: number
  fermaid_g?: number
  dap_g?: number
  citricAcid_g?: number
  calciumCarbonate_g?: number
  additionalNutrients?: string
  
  // Fermentation Target
  targetFermentationDays?: number
  targetFinalBrix?: number
  targetFinalPH?: number
  targetFinalABV_percent?: number
  
  // Distillation
  recommendedStill?: string
  boilerElements?: string
  retort1Elements?: string
  retort2Elements?: string
  retort1Content?: string
  retort2Content?: string
  
  // Target Output
  targetHeartsVolume_L?: number
  targetHeartsABV_percent?: number
  
  // Maturation
  maturationRecommended?: boolean
  recommendedCaskType?: string
  recommendedFillABV_percent?: number
  recommendedAgingMonths?: number
  
  // Process Notes
  fermentationNotes?: string
  distillationNotes?: string
  maturationNotes?: string
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type Recipe = GinVodkaSpiritRecipe | RumCaneSpiritRecipe

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isGinVodkaSpiritRecipe(recipe: Recipe): recipe is GinVodkaSpiritRecipe {
  return recipe.productType === 'gin' || recipe.productType === 'vodka' || recipe.productType === 'other'
}

export function isRumCaneSpiritRecipe(recipe: Recipe): recipe is RumCaneSpiritRecipe {
  return recipe.productType === 'rum' || recipe.productType === 'cane_spirit'
}


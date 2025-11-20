/**
 * RUM RECIPE CALCULATOR SERVICE
 * 
 * Calculates water dilution and ingredient scaling for rum product recipes
 * Based on user's input volume and ABV
 */

import { RUM_PRODUCT_RECIPES, type RumProductRecipe } from '../data/rum-product-recipes.dataset'

export interface CalculatorInput {
  input_volume_l: number    // Volume of rum you're adding
  input_abv: number          // Current ABV of your rum
  recipe_name: string        // Which recipe to use
}

export interface ScaledIngredient {
  name: string
  original_amount: number
  original_unit: 'ml' | 'g'
  scaled_amount: number
  scaled_unit: 'ml' | 'g'
  note?: string
}

export interface CalculatorOutput {
  // Input summary
  input_volume_l: number
  input_abv: number
  recipe_name: string
  
  // Calculated values
  total_volume_l: number      // Final volume at target ABV
  water_to_add_l: number      // How much water to add
  scale_factor: number        // Scaling factor for ingredients
  target_abv: number          // Target ABV from recipe
  
  // Scaled ingredients
  ingredients: ScaledIngredient[]
  
  // Recipe info
  master_batch_l: number      // Original recipe batch size
}

export class RumRecipeCalculatorService {
  /**
   * Calculate dilution and ingredient scaling
   */
  calculate(input: CalculatorInput): CalculatorOutput {
    // 1. Load the recipe
    const recipe = this.getRecipe(input.recipe_name)
    if (!recipe) {
      throw new Error(`Recipe not found: ${input.recipe_name}`)
    }

    const target_abv = this.getTargetABV(recipe)
    const master_batch_l = recipe.base_spirit.target_volume_l

    // 2. Calculate final volume at target ABV
    // Formula: V_total = (input_volume_l × input_abv) / target_abv
    const total_volume_l = (input.input_volume_l * input.input_abv) / target_abv

    // 3. Calculate water to add
    // Formula: water = V_total - input_volume_l
    const water_to_add_l = total_volume_l - input.input_volume_l

    // 4. Calculate scaling factor
    // Formula: scale = V_total / master_batch_l
    const scale_factor = total_volume_l / master_batch_l

    // 5. Scale all ingredients
    const ingredients = recipe.ingredients.map(ingredient => {
      const original_amount = ingredient.amount_ml || ingredient.amount_g || 0
      const original_unit = ingredient.amount_ml ? 'ml' : 'g'
      const scaled_amount = original_amount * scale_factor

      return {
        name: ingredient.name,
        original_amount,
        original_unit,
        scaled_amount,
        scaled_unit: original_unit,
        note: ingredient.note
      } as ScaledIngredient
    })

    // 6. Return complete calculation
    return {
      input_volume_l: input.input_volume_l,
      input_abv: input.input_abv,
      recipe_name: recipe.name,
      total_volume_l,
      water_to_add_l,
      scale_factor,
      target_abv,
      ingredients,
      master_batch_l
    }
  }

  /**
   * Get recipe by name or ID
   */
  private getRecipe(nameOrId: string): RumProductRecipe | null {
    // Normalize the input to match both hyphen and underscore formats
    const normalized = nameOrId.toLowerCase().replace(/_/g, '-')
    return RUM_PRODUCT_RECIPES.find(
      r => r.id === normalized ||
           r.id === nameOrId ||
           r.name === nameOrId ||
           r.name.toLowerCase() === nameOrId.toLowerCase()
    ) || null
  }

  /**
   * Get target ABV from recipe
   * Inferred from base spirit data
   */
  private getTargetABV(recipe: RumProductRecipe): number {
    // For Pineapple Rum and Spiced Rum: 40%
    // For Merchant Made Dark Rum: 37.5%
    if (recipe.id === 'merchant-made-dark-rum' || recipe.id === 'merchant_made_dark_rum') {
      return 37.5
    }
    return 40
  }

  /**
   * Get all available recipes
   */
  getAvailableRecipes(): Array<{ id: string; name: string; category: string }> {
    return RUM_PRODUCT_RECIPES.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category
    }))
  }

  /**
   * Format output for display
   */
  formatOutput(output: CalculatorOutput): string {
    const lines = [
      `${output.recipe_name} Calculator`,
      ``,
      `INPUT:`,
      `   Rum Volume: ${output.input_volume_l.toFixed(2)} L`,
      `   Rum ABV: ${output.input_abv.toFixed(1)}%`,
      ``,
      `DILUTION:`,
      `   Target ABV: ${output.target_abv.toFixed(1)}%`,
      `   Water to Add: ${output.water_to_add_l.toFixed(2)} L`,
      `   Final Volume: ${output.total_volume_l.toFixed(2)} L`,
      ``,
      `SCALING:`,
      `   Master Batch: ${output.master_batch_l} L`,
      `   Scale Factor: ${output.scale_factor.toFixed(4)}`,
      ``,
      `INGREDIENTS:`,
      ...output.ingredients.map(ing =>
        `   ${ing.name}: ${ing.scaled_amount.toFixed(2)} ${ing.scaled_unit}` +
        (ing.note ? ` (${ing.note})` : '')
      )
    ]
    return lines.join('\n')
  }
}


#!/usr/bin/env tsx
/**
 * Import Rum Product Recipes to Remote Supabase
 * NO DOCKER NEEDED - connects directly to remote Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { RUM_PRODUCT_RECIPES } from '../src/modules/recipes/data/rum-product-recipes.dataset'

// Remote Supabase configuration from .env.local
const SUPABASE_URL = 'https://dscmknufpfhxjcanzdsr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY21rbnVmcGZoeGpjYW56ZHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTgzOSwiZXhwIjoyMDc3OTUxODM5fQ.NanLP7UThboH3JUeFqkwy5dovfzxJotf2yljsTQs7rY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  console.log('🍹 Importing Rum Product Recipes to Supabase...\n')

  // Get organization ID
  const { data: orgs } = await supabase.from('organizations').select('id, name').limit(1)
  if (!orgs || orgs.length === 0) {
    console.error('❌ No organization found')
    process.exit(1)
  }
  const orgId = orgs[0].id
  console.log(`✅ Organization: ${orgs[0].name} (${orgId})\n`)

  let successCount = 0

  for (const recipe of RUM_PRODUCT_RECIPES) {
    console.log(`📝 Processing: ${recipe.name}`)

    try {
      // Upsert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .upsert({
          organization_id: orgId,
          name: recipe.name,
          notes: recipe.notes || `${recipe.category} rum product recipe`,
          description: getDescription(recipe)
        }, {
          onConflict: 'organization_id,name'
        })
        .select()
        .single()

      if (recipeError) throw recipeError
      if (!recipeData) throw new Error('No recipe data returned')

      const recipeId = recipeData.id

      // Delete existing ingredients
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId)

      // Insert ingredients
      for (const ingredient of recipe.ingredients) {
        // Get or create item
        const itemId = await getOrCreateItem(orgId, ingredient.name)

        const qty = ingredient.amount_ml || ingredient.amount_g || 0
        const uom = ingredient.amount_ml ? 'ml' : 'g'

        const { error: ingredientError } = await supabase
          .from('recipe_ingredients')
          .insert({
            organization_id: orgId,
            recipe_id: recipeId,
            item_id: itemId,
            qty_per_batch: qty,
            uom: uom,
            step: 'proofing', // Rum products are mixed during proofing/finishing
            notes: ingredient.note || null
          })

        if (ingredientError) throw ingredientError
      }

      console.log(`   ✅ ${recipe.name} - ${recipe.ingredients.length} ingredients`)
      successCount++
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`)
    }
  }

  console.log(`\n🎉 Import complete! ${successCount}/${RUM_PRODUCT_RECIPES.length} recipes imported`)
}

async function getOrCreateItem(orgId: string, itemName: string): Promise<string> {
  // Check if exists
  const { data: existing } = await supabase
    .from('items')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', itemName)
    .single()

  if (existing) return existing.id

  // Create new
  const category = getCategoryForIngredient(itemName)
  const defaultUom = itemName.toLowerCase().includes('glycer') ||
                     itemName.toLowerCase().includes('flavour') ||
                     itemName.toLowerCase().includes('flavor') ||
                     itemName.toLowerCase().includes('colour') ||
                     itemName.toLowerCase().includes('color') ||
                     itemName.toLowerCase().includes('essence') ? 'ml' : 'g'

  const { data: newItem, error } = await supabase
    .from('items')
    .insert({
      organization_id: orgId,
      name: itemName,
      category: category,
      default_uom: defaultUom,
      is_alcohol: false
    })
    .select()
    .single()

  if (error) throw error
  if (!newItem) throw new Error(`Failed to create item: ${itemName}`)

  return newItem.id
}

function getCategoryForIngredient(itemName: string): string {
  const name = itemName.toLowerCase()
  if (name.includes('flavour') || name.includes('flavor') || name.includes('essence')) return 'flavoring'
  if (name.includes('glycer')) return 'additive'
  if (name.includes('colour') || name.includes('color') || name.includes('caramel')) return 'additive'
  if (name.includes('peel')) return 'botanical'
  return 'spice'
}

function getDescription(recipe: typeof RUM_PRODUCT_RECIPES[0]): string {
  const descriptions: Record<string, string> = {
    'Pineapple Rum': 'Tropical pineapple-flavored rum with natural flavoring and glycerin for smoothness',
    'Spiced Rum': 'Traditional spiced rum with cinnamon, cardamom, cloves, star anise, citrus peels, and vanilla',
    'Merchant Made Dark Rum': 'Rich dark rum with caramel color and flavor for depth and sweetness'
  }
  return descriptions[recipe.name] || `${recipe.category} rum product`
}

main()


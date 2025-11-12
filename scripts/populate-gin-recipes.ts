/**
 * Script to populate gin recipes with botanical data
 * Run with: NEXT_PUBLIC_SUPABASE_URL=xxx NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx npx tsx scripts/populate-gin-recipes.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env.local file
const envFile = readFileSync('.env.local', 'utf-8')
const envVars: Record<string, string> = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const recipes = [
  {
    recipe_name: 'Rainforest Gin',
    product_type: 'gin',
    description: 'Tropical botanical gin with native Australian ingredients',
    data: {
      botanicals: [
        { name: 'Juniper', weight_g: 6360, ratio_percent: 0, notes: '' },
        { name: 'Coriander', weight_g: 1410, ratio_percent: 0, notes: '' },
        { name: 'Angelica', weight_g: 175, ratio_percent: 0, notes: '' },
        { name: 'Cassia', weight_g: 25, ratio_percent: 0, notes: '' },
        { name: 'Lemon Myrtle', weight_g: 141, ratio_percent: 0, notes: '' },
        { name: 'Lemon Aspen', weight_g: 71, ratio_percent: 0, notes: '' },
        { name: 'Grapefruit peel', weight_g: 567, ratio_percent: 0, notes: '' },
        { name: 'Macadamia', weight_g: 102, ratio_percent: 0, notes: '' },
        { name: 'Liquorice', weight_g: 51, ratio_percent: 0, notes: '' },
        { name: 'Cardamon', weight_g: 141, ratio_percent: 0, notes: '' },
        { name: 'Pepperberry', weight_g: 102, ratio_percent: 0, notes: '' },
        { name: 'Vanilla', weight_g: 25, ratio_percent: 0, notes: '' },
        { name: 'Mango', weight_g: 176, ratio_percent: 0, notes: '' },
      ],
      targetHearts_L: 280,
      targetHeartsABV_percent: 82,
      targetFinalABV_percent: 43,
      recommendedStill: 'Roberta 1000L',
      elements: 'Top + Bottom On',
      plates: '4',
      steepingHours: 18,
    },
    is_active: true,
  },
  {
    recipe_name: 'Oaks Kitchen Gin',
    product_type: 'gin',
    description: 'Traditional signature dry gin',
    data: {
      botanicals: [
        { name: 'Juniper', weight_g: 6400, ratio_percent: 0, notes: '' },
        { name: 'Coriander', weight_g: 1800, ratio_percent: 0, notes: '' },
        { name: 'Angelica', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Orris Root', weight_g: 90, ratio_percent: 0, notes: '' },
        { name: 'Orange peel', weight_g: 560, ratio_percent: 0, notes: '' },
        { name: 'Lemon peel', weight_g: 560, ratio_percent: 0, notes: '' },
        { name: 'Macadamia', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Liquorice', weight_g: 100, ratio_percent: 0, notes: '' },
        { name: 'Cardamon', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Lavender', weight_g: 40, ratio_percent: 0, notes: '' },
      ],
      targetHearts_L: 258,
      targetHeartsABV_percent: 80.6,
      targetFinalABV_percent: 43,
      recommendedStill: 'Roberta 1000L',
      elements: 'Top + Bottom On',
      plates: '4',
      steepingHours: 18,
    },
    is_active: true,
  },
  {
    recipe_name: 'Navy Strength Gin',
    product_type: 'gin',
    description: 'High-proof botanical gin',
    data: {
      botanicals: [
        { name: 'Juniper', weight_g: 6400, ratio_percent: 0, notes: '' },
        { name: 'Coriander', weight_g: 1800, ratio_percent: 0, notes: '' },
        { name: 'Angelica', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Orris Root', weight_g: 90, ratio_percent: 0, notes: '' },
        { name: 'Orange peel', weight_g: 380, ratio_percent: 0, notes: '' },
        { name: 'Lemon peel', weight_g: 380, ratio_percent: 0, notes: '' },
        { name: 'Finger Lime', weight_g: 380, ratio_percent: 0, notes: '' },
        { name: 'Macadamia', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Liquorice', weight_g: 100, ratio_percent: 0, notes: '' },
        { name: 'Cardamon', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Chamomile', weight_g: 90, ratio_percent: 0, notes: '' },
      ],
      targetHearts_L: 306,
      targetHeartsABV_percent: 82,
      targetFinalABV_percent: 57,
      recommendedStill: 'Carrie 1000L',
      elements: 'Top + Bottom On',
      plates: '4',
      steepingHours: 18,
    },
    is_active: true,
  },
  {
    recipe_name: 'Merchant Mae Gin',
    product_type: 'gin',
    description: 'Classic gin recipe',
    data: {
      botanicals: [
        { name: 'Juniper', weight_g: 6400, ratio_percent: 0, notes: '' },
        { name: 'Coriander', weight_g: 1800, ratio_percent: 0, notes: '' },
        { name: 'Angelica', weight_g: 180, ratio_percent: 0, notes: '' },
        { name: 'Orris Root', weight_g: 50, ratio_percent: 0, notes: '' },
        { name: 'Orange', weight_g: 380, ratio_percent: 0, notes: '' },
        { name: 'Lemon', weight_g: 380, ratio_percent: 0, notes: '' },
        { name: 'Liquorice', weight_g: 100, ratio_percent: 0, notes: '' },
        { name: 'Cardamon', weight_g: 150, ratio_percent: 0, notes: '' },
        { name: 'Chamomile', weight_g: 50, ratio_percent: 0, notes: '' },
      ],
      targetHearts_L: 332,
      targetHeartsABV_percent: 82,
      targetFinalABV_percent: 43,
      recommendedStill: 'Roberta 1000L',
      elements: 'Top + Bottom On',
      plates: '4',
      steepingHours: 18,
    },
    is_active: true,
  },
  {
    recipe_name: 'Oaks Kitchen Gin - Dry Season',
    product_type: 'gin',
    description: 'Thai-inspired botanical gin',
    data: {
      botanicals: [
        { name: 'Juniper', weight_g: 6250, ratio_percent: 0, notes: '' },
        { name: 'Coriander Seed', weight_g: 625, ratio_percent: 0, notes: '' },
        { name: 'Angelica', weight_g: 167, ratio_percent: 0, notes: '' },
        { name: 'Cardamon', weight_g: 83, ratio_percent: 0, notes: '' },
        { name: 'Lemongrass', weight_g: 1167, ratio_percent: 0, notes: '' },
        { name: 'Mandarin', weight_g: 1667, ratio_percent: 0, notes: '' },
        { name: 'Mandarin Skin', weight_g: 1200, ratio_percent: 0, notes: '' },
        { name: 'Turmeric', weight_g: 500, ratio_percent: 0, notes: '' },
        { name: 'Rosella Flower', weight_g: 1667, ratio_percent: 0, notes: '' },
        { name: 'Holy Basil', weight_g: 167, ratio_percent: 0, notes: '' },
        { name: 'Thai Basil', weight_g: 1000, ratio_percent: 0, notes: '' },
        { name: 'Kaffir Lime Leaf', weight_g: 333, ratio_percent: 0, notes: '' },
      ],
      targetHearts_L: 199,
      targetHeartsABV_percent: 81.4,
      targetFinalABV_percent: 43,
      recommendedStill: 'Carrie 1000L',
      elements: 'Top + Bottom On',
      plates: '4',
      steepingHours: 18,
    },
    is_active: true,
  },
  {
    recipe_name: 'Wet Season Gin',
    product_type: 'gin',
    description: 'Thai-inspired wet season botanical gin',
    data: {
      botanicals: [
        { name: 'Juniper', weight_g: 6250, ratio_percent: 0, notes: '' },
        { name: 'Sawtooth Coriander', weight_g: 625, ratio_percent: 0, notes: '' },
        { name: 'Angelica', weight_g: 168, ratio_percent: 0, notes: '' },
        { name: 'Holy Basil', weight_g: 252, ratio_percent: 0, notes: '' },
        { name: 'Thai Sweet Basil', weight_g: 168, ratio_percent: 0, notes: '' },
        { name: 'Kaffir Fruit Rind', weight_g: 832, ratio_percent: 0, notes: '' },
        { name: 'Kaffir Leaves', weight_g: 500, ratio_percent: 0, notes: '' },
        { name: 'Thai Marigolds', weight_g: 332, ratio_percent: 0, notes: '' },
        { name: 'Galangal', weight_g: 332, ratio_percent: 0, notes: '' },
        { name: 'Lemongrass', weight_g: 252, ratio_percent: 0, notes: '' },
        { name: 'Liquorice Root', weight_g: 84, ratio_percent: 0, notes: '' },
        { name: 'Cardamon', weight_g: 84, ratio_percent: 0, notes: '' },
        { name: 'Pandanus', weight_g: 108, ratio_percent: 0, notes: '' },
      ],
      targetHearts_L: 251,
      targetHeartsABV_percent: 81.3,
      targetFinalABV_percent: 43,
      recommendedStill: 'Roberta 1000L',
      elements: 'Top + Bottom On',
      plates: '4',
      steepingHours: 18,
    },
    is_active: true,
  },
]

async function populateRecipes() {
  console.log('🌿 Populating gin recipes with botanical data...\n')

  for (const recipe of recipes) {
    console.log(`📝 Updating: ${recipe.recipe_name}`)
    
    const { data, error } = await supabase
      .from('production_recipes')
      .update({
        data: recipe.data,
        description: recipe.description,
      })
      .eq('recipe_name', recipe.recipe_name)
      .eq('product_type', recipe.product_type)
      .select()

    if (error) {
      console.error(`❌ Error updating ${recipe.recipe_name}:`, error)
    } else if (data && data.length > 0) {
      console.log(`✅ Updated ${recipe.recipe_name} with ${recipe.data.botanicals?.length} botanicals`)
    } else {
      console.log(`⚠️  Recipe not found, inserting: ${recipe.recipe_name}`)
      
      const { error: insertError } = await supabase
        .from('production_recipes')
        .insert({
          recipe_name: recipe.recipe_name,
          product_type: recipe.product_type,
          description: recipe.description,
          data: recipe.data,
          is_active: recipe.is_active,
        })

      if (insertError) {
        console.error(`❌ Error inserting ${recipe.recipe_name}:`, insertError)
      } else {
        console.log(`✅ Inserted ${recipe.recipe_name}`)
      }
    }
  }

  console.log('\n✨ Done!')
}

populateRecipes()


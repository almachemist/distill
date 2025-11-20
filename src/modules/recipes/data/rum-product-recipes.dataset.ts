/**
 * RUM PRODUCT RECIPES
 * 
 * Recipes for finished rum products (flavored, spiced, dark rums)
 * These are made from base spirit + ingredients (not fermentation/distillation recipes)
 */

export interface RumProductIngredient {
  name: string
  amount_ml?: number
  amount_g?: number
  scaled_amount_ml?: number
  scaled_amount_g?: number
  note?: string
}

export interface RumProductRecipe {
  id: string
  name: string
  added_on?: string
  category: 'flavored' | 'spiced' | 'dark' | 'liqueur'
  base_spirit: {
    target_volume_l: number
    source_volume_l?: number
    source_abv_percent: number
    scaling_factor?: number
  }
  ingredients: RumProductIngredient[]
  notes?: string
}

export const RUM_PRODUCT_RECIPES: RumProductRecipe[] = [
  {
    id: 'pineapple-rum',
    name: 'Pineapple Rum',
    added_on: '2025-08-28',
    category: 'flavored',
    base_spirit: {
      target_volume_l: 255,
      source_volume_l: 96,
      source_abv_percent: 40,
      scaling_factor: 137.1428571
    },
    ingredients: [
      {
        name: 'Pineapple Flavour',
        amount_ml: 30,
        scaled_amount_ml: 11.3,
        note: 'ok'
      },
      {
        name: 'Glycerin',
        amount_ml: 200,
        scaled_amount_ml: 75.3,
        note: 'ok'
      }
    ]
  },

  {
    id: 'spiced-rum',
    name: 'Spiced Rum',
    added_on: '2025-08-27',
    category: 'spiced',
    base_spirit: {
      target_volume_l: 136,
      source_volume_l: 75,
      source_abv_percent: 40,
      scaling_factor: 107.1428571
    },
    ingredients: [
      {
        name: 'Cinnamon',
        amount_g: 51,
        scaled_amount_g: 28.13,
        note: 'ok but can reduce'
      },
      {
        name: 'Cardamom',
        amount_g: 7,
        scaled_amount_g: 3.86,
        note: 'ok'
      },
      {
        name: 'Cloves',
        amount_g: 3,
        scaled_amount_g: 1.65,
        note: 'ok'
      },
      {
        name: 'Star Anise',
        amount_g: 4,
        scaled_amount_g: 2.21,
        note: 'ok'
      },
      {
        name: 'Orange Peel',
        amount_g: 220,
        scaled_amount_g: 121.32,
        note: 'increase by 10g'
      },
      {
        name: 'Lime Peel',
        amount_g: 220,
        scaled_amount_g: 121.32,
        note: 'increase by 10g'
      },
      {
        name: 'Vanilla Essence',
        amount_ml: 100,
        scaled_amount_ml: 55.15,
        note: 'ok'
      },
      {
        name: 'Glycerine',
        amount_ml: 85,
        scaled_amount_ml: 46.88,
        note: 'ok'
      }
    ]
  },

  {
    id: 'merchant-made-dark-rum',
    name: 'Merchant Made Dark Rum',
    category: 'dark',
    base_spirit: {
      target_volume_l: 281,
      source_abv_percent: 37.5
    },
    ingredients: [
      {
        name: 'Caramel Colour',
        amount_ml: 175
      },
      {
        name: 'Glycerine',
        amount_ml: 150
      },
      {
        name: 'Caramel Flavour (Monin)',
        amount_ml: 300
      }
    ]
  }
]

export default RUM_PRODUCT_RECIPES


import type { ProductType } from '@/types/bottling'

export const PRODUCT_LIST = [
  // Devil's Thumb Products
  { value: 'Rainforest Gin', label: 'Rainforest Gin', type: 'gin' as ProductType },
  { value: 'Signature Dry Gin', label: 'Signature Dry Gin', type: 'gin' as ProductType },
  { value: 'Navy Strength Gin', label: 'Navy Strength Gin', type: 'gin' as ProductType },
  { value: 'Wet Season Gin', label: 'Wet Season Gin', type: 'gin' as ProductType },
  { value: 'Dry Season Gin', label: 'Dry Season Gin', type: 'gin' as ProductType },
  { value: 'Australian Cane Spirit', label: 'Australian Cane Spirit', type: 'cane_spirit' as ProductType },
  { value: 'Pineapple Rum', label: 'Pineapple Rum', type: 'pineapple_rum' as ProductType },
  { value: 'Spiced Rum', label: 'Spiced Rum', type: 'spiced_rum' as ProductType },
  { value: 'Reserve Cask Rum', label: 'Reserve Cask Rum', type: 'rum' as ProductType },
  { value: 'Coffee Liqueur', label: 'Coffee Liqueur', type: 'coffee_liqueur' as ProductType },

  // Merchant Mae Products
  { value: 'Merchant Mae Gin', label: 'Merchant Mae Gin', type: 'gin' as ProductType },
  { value: 'Merchant Mae Vodka', label: 'Merchant Mae Vodka', type: 'vodka' as ProductType },
  { value: 'Merchant Mae Golden Sunrise', label: 'Merchant Mae Golden Sunrise', type: 'vodka' as ProductType },
  { value: 'Merchant Mae Berry Burst', label: 'Merchant Mae Berry Burst', type: 'vodka' as ProductType },
  { value: 'Merchant Mae White Rum', label: 'Merchant Mae White Rum', type: 'rum' as ProductType },
  { value: 'Merchant Mae Dark Rum', label: 'Merchant Mae Dark Rum', type: 'rum' as ProductType },
]

export function inferProductType(name: string): ProductType {
  const p = PRODUCT_LIST.find(p => p.value === name)
  if (p) return p.type
  const n = (name || '').toLowerCase()
  if (n.includes('rum')) return 'rum'
  if (n.includes('gin')) return 'gin'
  if (n.includes('vodka')) return 'vodka'
  if (n.includes('cane')) return 'cane_spirit'
  if (n.includes('coffee')) return 'coffee_liqueur'
  if (n.includes('liqueur')) return 'other_liqueur'
  return 'gin'
}

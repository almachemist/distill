export type MockRecipe = {
  id: string
  name: string
  description: string
  abv: number
  batchVolume: number
  totalCost: number
  freshMarketCost?: number
  ingredients: { name: string; quantity: number; unit: string; pricePerKg?: number; pricePerBatch?: number }[]
  productionTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export type MockInventoryItem = {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerKg?: number
  minThreshold: number
}

export const MOCK_RECIPES: MockRecipe[] = [
  {
    id: "rainforest-gin",
    name: "Rainforest Gin",
    description: "Australian native botanicals with tropical notes",
    abv: 42,
    batchVolume: 100,
    totalCost: 430.44,
    ingredients: [
      { name: "Juniper", quantity: 6360, unit: "g", pricePerKg: 40.273, pricePerBatch: 256.14 },
      { name: "Coriander", quantity: 1410, unit: "g", pricePerKg: 12.852, pricePerBatch: 18.12 },
      { name: "Angelica", quantity: 175, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.18 },
      { name: "Cassia", quantity: 25, unit: "g", pricePerKg: 32.5, pricePerBatch: 0.81 },
      { name: "Lemon Myrtle", quantity: 141, unit: "g", pricePerKg: 133.76, pricePerBatch: 18.86 },
      { name: "Lemon Aspen", quantity: 71, unit: "g", pricePerKg: 760, pricePerBatch: 53.96 },
      { name: "Grapefruit Peel", quantity: 567, unit: "g", pricePerKg: 5.9, pricePerBatch: 14.22 },
      { name: "Macadamia", quantity: 102, unit: "g", pricePerKg: 41.67, pricePerBatch: 4.25 },
      { name: "Liquorice", quantity: 51, unit: "g", pricePerKg: 28.08, pricePerBatch: 1.43 },
      { name: "Cardamon", quantity: 141, unit: "g", pricePerKg: 64.14, pricePerBatch: 9.04 },
      { name: "Pepperberry", quantity: 102, unit: "g", pricePerKg: 29.75, pricePerBatch: 3.03 },
      { name: "Vanilla", quantity: 25, unit: "g", pricePerKg: 1500, pricePerBatch: 37.5 },
      { name: "Mango", quantity: 176, unit: "g", pricePerKg: 2.9, pricePerBatch: 2.9 }
    ],
    productionTime: 24,
    difficulty: 'medium',
    category: 'contemporary'
  },
  {
    id: "signature-dry-gin",
    name: "Signature Dry Gin (Traditional)",
    description: "Classic London Dry style with traditional botanicals",
    abv: 40,
    batchVolume: 100,
    totalCost: 339.76,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.75 },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13 },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47 },
      { name: "Orris Root", quantity: 90, unit: "g", pricePerKg: 52.32, pricePerBatch: 4.71 },
      { name: "Orange Peel", quantity: 560, unit: "g", pricePerKg: 3.99, pricePerBatch: 6.98 },
      { name: "Lemon Peel", quantity: 560, unit: "g", pricePerKg: 6.99, pricePerBatch: 12.48 },
      { name: "Macadamia", quantity: 180, unit: "g", pricePerKg: 41.67, pricePerBatch: 7.5 },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81 },
      { name: "Cardamon", quantity: 180, unit: "g", pricePerKg: 64.14, pricePerBatch: 11.55 },
      { name: "Lavender", quantity: 40, unit: "g", pricePerKg: 59.5, pricePerBatch: 2.38 }
    ],
    productionTime: 18,
    difficulty: 'easy',
    category: 'traditional'
  },
  {
    id: "navy-strength-gin",
    name: "Navy Strength Gin",
    description: "High-proof traditional gin with Australian finger lime",
    abv: 58.8,
    batchVolume: 100,
    totalCost: 345.41,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.73 },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13 },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47 },
      { name: "Orris Root", quantity: 90, unit: "g", pricePerKg: 52.32, pricePerBatch: 4.71 },
      { name: "Orange Peel", quantity: 380, unit: "g", pricePerKg: 3.99, pricePerBatch: 4.74 },
      { name: "Lemon Peel", quantity: 380, unit: "g", pricePerKg: 6.99, pricePerBatch: 8.47 },
      { name: "Finger Lime", quantity: 380, unit: "g", pricePerKg: 30, pricePerBatch: 11.4 },
      { name: "Macadamia", quantity: 180, unit: "g", pricePerKg: 41.67, pricePerBatch: 7.5 },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81 },
      { name: "Cardamon", quantity: 180, unit: "g", pricePerKg: 64.14, pricePerBatch: 11.55 },
      { name: "Chamomile", quantity: 90, unit: "g", pricePerKg: 32.2, pricePerBatch: 2.9 }
    ],
    productionTime: 20,
    difficulty: 'medium',
    category: 'traditional'
  },
  {
    id: "merchant-made-gin",
    name: "Merchant Made Gin",
    description: "Traditional gin with chamomile and citrus notes",
    abv: 37,
    batchVolume: 100,
    totalCost: 312.17,
    ingredients: [
      { name: "Juniper", quantity: 6400, unit: "g", pricePerKg: 40.273, pricePerBatch: 257.73 },
      { name: "Coriander", quantity: 1800, unit: "g", pricePerKg: 12.852, pricePerBatch: 23.13 },
      { name: "Angelica", quantity: 180, unit: "g", pricePerKg: 58.17, pricePerBatch: 10.47 },
      { name: "Orris Root", quantity: 50, unit: "g", pricePerKg: 52.32, pricePerBatch: 2.62 },
      { name: "Orange", quantity: 380, unit: "g", pricePerKg: 3.99, pricePerBatch: 1.52 },
      { name: "Lemon", quantity: 380, unit: "g", pricePerKg: 6.99, pricePerBatch: 2.66 },
      { name: "Liquorice", quantity: 100, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.81 },
      { name: "Cardamon", quantity: 150, unit: "g", pricePerKg: 64.14, pricePerBatch: 9.62 },
      { name: "Chamomile", quantity: 50, unit: "g", pricePerKg: 32.2, pricePerBatch: 1.61 }
    ],
    productionTime: 20,
    difficulty: 'easy',
    category: 'traditional'
  },
  {
    id: "dry-season-gin",
    name: "Dry Season Gin",
    description: "Asian-inspired gin with fresh market botanicals",
    abv: 40,
    batchVolume: 100,
    totalCost: 424.75,
    freshMarketCost: 150,
    ingredients: [
      { name: "Juniper", quantity: 6250, unit: "g", pricePerKg: 40.273, pricePerBatch: 251.69 },
      { name: "Coriander Seed", quantity: 625, unit: "g", pricePerKg: 12.852, pricePerBatch: 8.03 },
      { name: "Angelica", quantity: 167, unit: "g", pricePerKg: 58.17, pricePerBatch: 9.71 },
      { name: "Cardamon", quantity: 83, unit: "g", pricePerKg: 64.14, pricePerBatch: 5.32 },
      { name: "Lemongrass", quantity: 1167, unit: "g" },
      { name: "Mandarin", quantity: 1667, unit: "g" },
      { name: "Mandarin Skin", quantity: 1200, unit: "g" },
      { name: "Turmeric", quantity: 500, unit: "g" },
      { name: "Rosella Flower", quantity: 1667, unit: "g" },
      { name: "Holy Basil", quantity: 167, unit: "g" },
      { name: "Thai Basil", quantity: 1000, unit: "g" },
      { name: "Kaffir Lime Leaf", quantity: 333, unit: "g" }
    ],
    productionTime: 22,
    difficulty: 'medium',
    category: 'contemporary'
  },
  {
    id: "wet-season-gin",
    name: "Wet Season Gin",
    description: "Tropical gin with Thai and Southeast Asian botanicals",
    abv: 42,
    batchVolume: 100,
    totalCost: 409.44,
    freshMarketCost: 150,
    ingredients: [
      { name: "Juniper", quantity: 6250, unit: "g", pricePerKg: 40.27, pricePerBatch: 251.69 },
      { name: "Sawtooth Coriander", quantity: 625, unit: "g" },
      { name: "Angelica", quantity: 168, unit: "g" },
      { name: "Holy Basil", quantity: 252, unit: "g" },
      { name: "Thai Sweet Basil", quantity: 168, unit: "g" },
      { name: "Kaffir Fruit Rind", quantity: 832, unit: "g" },
      { name: "Kaffir Leaves", quantity: 500, unit: "g" },
      { name: "Thai Marigolds", quantity: 332, unit: "g" },
      { name: "Galangal", quantity: 332, unit: "g" },
      { name: "Lemongrass", quantity: 252, unit: "g" },
      { name: "Liquorice Root", quantity: 84, unit: "g", pricePerKg: 28.08, pricePerBatch: 2.36 },
      { name: "Cardamon", quantity: 84, unit: "g", pricePerKg: 64.14, pricePerBatch: 5.39 },
      { name: "Pandanus", quantity: 108, unit: "g" }
    ],
    productionTime: 24,
    difficulty: 'medium',
    category: 'contemporary'
  }
]

export const MOCK_INVENTORY: MockInventoryItem[] = [
  { id: "juniper", name: "Juniper", quantity: 0, unit: "g", pricePerKg: 40.273, minThreshold: 5000 },
  { id: "coriander", name: "Coriander", quantity: 0, unit: "g", pricePerKg: 12.852, minThreshold: 3000 },
  { id: "angelica", name: "Angelica", quantity: 0, unit: "g", pricePerKg: 58.17, minThreshold: 1000 },
  { id: "cassia", name: "Cassia", quantity: 0, unit: "g", pricePerKg: 32.5, minThreshold: 500 },
  { id: "lemon-myrtle", name: "Lemon Myrtle", quantity: 0, unit: "g", pricePerKg: 133.76, minThreshold: 1000 },
  { id: "lemon-aspen", name: "Lemon Aspen", quantity: 0, unit: "g", pricePerKg: 760, minThreshold: 500 },
  { id: "grapefruit-peel", name: "Grapefruit Peel", quantity: 0, unit: "g", pricePerKg: 5.9, minThreshold: 500 },
  { id: "macadamia", name: "Macadamia", quantity: 0, unit: "g", pricePerKg: 41.67, minThreshold: 500 },
  { id: "liquorice", name: "Liquorice", quantity: 0, unit: "g", pricePerKg: 28.08, minThreshold: 200 },
  { id: "cardamon", name: "Cardamon", quantity: 0, unit: "g", pricePerKg: 64.14, minThreshold: 100 },
  { id: "pepperberry", name: "Pepperberry", quantity: 0, unit: "g", pricePerKg: 29.75, minThreshold: 300 },
  { id: "vanilla", name: "Vanilla", quantity: 0, unit: "g", pricePerKg: 1500, minThreshold: 100 },
  { id: "mango", name: "Mango", quantity: 0, unit: "g", pricePerKg: 2.9, minThreshold: 1000 },
  { id: "orris-root", name: "Orris Root", quantity: 0, unit: "g", pricePerKg: 52.32, minThreshold: 500 },
  { id: "orange-peel", name: "Orange Peel", quantity: 0, unit: "g", pricePerKg: 3.99, minThreshold: 2000 },
  { id: "lemon-peel", name: "Lemon Peel", quantity: 0, unit: "g", pricePerKg: 6.99, minThreshold: 1500 },
  { id: "lavender", name: "Lavender", quantity: 0, unit: "g", pricePerKg: 59.5, minThreshold: 1000 },
  { id: "orange", name: "Orange", quantity: 0, unit: "g", pricePerKg: 3.99, minThreshold: 1500 },
  { id: "lemon", name: "Lemon", quantity: 0, unit: "g", pricePerKg: 6.99, minThreshold: 1500 },
  { id: "chamomile", name: "Chamomile", quantity: 0, unit: "g", pricePerKg: 32.2, minThreshold: 300 },
  { id: "finger-lime", name: "Finger Lime", quantity: 0, unit: "g", pricePerKg: 30, minThreshold: 500 },
  // Dry Season Gin botanicals
  { id: "coriander-seed", name: "Coriander Seed", quantity: 0, unit: "g", pricePerKg: 12.852, minThreshold: 1000 },
  { id: "lemongrass", name: "Lemongrass", quantity: 0, unit: "g", minThreshold: 2000 },
  { id: "mandarin", name: "Mandarin", quantity: 0, unit: "g", minThreshold: 3000 },
  { id: "mandarin-skin", name: "Mandarin Skin", quantity: 0, unit: "g", minThreshold: 2000 },
  { id: "turmeric", name: "Turmeric", quantity: 0, unit: "g", minThreshold: 1000 },
  { id: "rosella-flower", name: "Rosella Flower", quantity: 0, unit: "g", minThreshold: 3000 },
  { id: "holy-basil", name: "Holy Basil", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "thai-basil", name: "Thai Basil", quantity: 0, unit: "g", minThreshold: 2000 },
  { id: "kaffir-lime-leaf", name: "Kaffir Lime Leaf", quantity: 0, unit: "g", minThreshold: 1000 },
  // Wet Season Gin botanicals
  { id: "sawtooth-coriander", name: "Sawtooth Coriander", quantity: 0, unit: "g", minThreshold: 1000 },
  { id: "thai-sweet-basil", name: "Thai Sweet Basil", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "kaffir-fruit-rind", name: "Kaffir Fruit Rind", quantity: 0, unit: "g", minThreshold: 1500 },
  { id: "kaffir-leaves", name: "Kaffir Leaves", quantity: 0, unit: "g", minThreshold: 1000 },
  { id: "thai-marigolds", name: "Thai Marigolds", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "galangal", name: "Galangal", quantity: 0, unit: "g", minThreshold: 500 },
  { id: "pandanus", name: "Pandanus", quantity: 0, unit: "g", minThreshold: 200 }
]

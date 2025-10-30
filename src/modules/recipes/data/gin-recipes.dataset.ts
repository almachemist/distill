export interface GinBotanical {
  name: string
  weight_g: number | null
  price_per_kg: number | null
  price_per_batch: number | null
}

export interface GinRecipeSnapshot {
  name: string
  total_cost: number | null
  last_batch: {
    volume_l: number
    abv_percent: number
    water_l: number
  }
  botanicals: GinBotanical[]
}

export interface GinRecipesDataset {
  recipes: GinRecipeSnapshot[]
}

export const ginRecipesDataset: GinRecipesDataset = {
  recipes: [
    {
      name: "Rainforest Gin",
      total_cost: 430.44,
      last_batch: { volume_l: 280, abv_percent: 82, water_l: 266 },
      botanicals: [
        { name: "Juniper", weight_g: 6360, price_per_kg: 40.273, price_per_batch: 256.14 },
        { name: "Coriander", weight_g: 1410, price_per_kg: 12.852, price_per_batch: 18.12 },
        { name: "Angelica", weight_g: 175, price_per_kg: 58.17, price_per_batch: 10.18 },
        { name: "Cassia", weight_g: 25, price_per_kg: 32.5, price_per_batch: 0.81 },
        { name: "Lemon Myrtle", weight_g: 141, price_per_kg: 133.76, price_per_batch: 18.86 },
        { name: "Lemon Aspen", weight_g: 71, price_per_kg: 760, price_per_batch: 53.96 },
        { name: "Grapefruit peel", weight_g: 567, price_per_kg: 5.9, price_per_batch: 14.22 },
        { name: "Macadamia", weight_g: 102, price_per_kg: 41.67, price_per_batch: 4.25 },
        { name: "Liquorice", weight_g: 51, price_per_kg: 28.08, price_per_batch: 1.43 },
        { name: "Cardamon", weight_g: 141, price_per_kg: 64.14, price_per_batch: 9.04 },
        { name: "Pepperberry", weight_g: 102, price_per_kg: 29.75, price_per_batch: 3.03 },
        { name: "Vanilla", weight_g: 25, price_per_kg: 1500, price_per_batch: 37.5 },
        { name: "Mango", weight_g: 176, price_per_kg: 2.9, price_per_batch: 2.9 }
      ]
    },
    {
      name: "Signature Dry Gin (Traditional)",
      total_cost: 339.76,
      last_batch: { volume_l: 258, abv_percent: 80.6, water_l: 237 },
      botanicals: [
        { name: "Juniper", weight_g: 6400, price_per_kg: 40.273, price_per_batch: 257.75 },
        { name: "Coriander", weight_g: 1800, price_per_kg: 12.852, price_per_batch: 23.13 },
        { name: "Angelica", weight_g: 180, price_per_kg: 58.17, price_per_batch: 10.47 },
        { name: "Orris Root", weight_g: 90, price_per_kg: 52.32, price_per_batch: 4.71 },
        { name: "Orange peel", weight_g: 560, price_per_kg: 3.99, price_per_batch: 6.98 },
        { name: "Lemon peel", weight_g: 560, price_per_kg: 6.99, price_per_batch: 12.48 },
        { name: "Macadamia", weight_g: 180, price_per_kg: 41.67, price_per_batch: 7.5 },
        { name: "Liquorice", weight_g: 100, price_per_kg: 28.08, price_per_batch: 2.81 },
        { name: "Cardamon", weight_g: 180, price_per_kg: 64.14, price_per_batch: 11.55 },
        { name: "Lavender", weight_g: 40, price_per_kg: 59.5, price_per_batch: 2.38 }
      ]
    },
    {
      name: "Navy Strength Gin",
      total_cost: 345.41,
      last_batch: { volume_l: 306, abv_percent: 82, water_l: 120 },
      botanicals: [
        { name: "Juniper", weight_g: 6400, price_per_kg: 40.273, price_per_batch: 257.73 },
        { name: "Coriander", weight_g: 1800, price_per_kg: 12.852, price_per_batch: 23.13 },
        { name: "Angelica", weight_g: 180, price_per_kg: 58.17, price_per_batch: 10.47 },
        { name: "Orris Root", weight_g: 90, price_per_kg: 52.32, price_per_batch: 4.71 },
        { name: "Orange peel", weight_g: 380, price_per_kg: 3.99, price_per_batch: 4.74 },
        { name: "Lemon peel", weight_g: 380, price_per_kg: 6.99, price_per_batch: 8.47 },
        { name: "Finger Lime", weight_g: 380, price_per_kg: 30, price_per_batch: 11.4 },
        { name: "Macadamia", weight_g: 180, price_per_kg: 41.67, price_per_batch: 7.5 },
        { name: "Liquorice", weight_g: 100, price_per_kg: 28.08, price_per_batch: 2.81 },
        { name: "Cardamon", weight_g: 180, price_per_kg: 64.14, price_per_batch: 11.55 },
        { name: "Chamomile", weight_g: 90, price_per_kg: 32.2, price_per_batch: 2.9 }
      ]
    },
    {
      name: "MM Gin",
      total_cost: 312.17,
      last_batch: { volume_l: 332, abv_percent: 82, water_l: 397 },
      botanicals: [
        { name: "Juniper", weight_g: 6400, price_per_kg: 40.273, price_per_batch: 257.73 },
        { name: "Coriander", weight_g: 1800, price_per_kg: 12.852, price_per_batch: 23.13 },
        { name: "Angelica", weight_g: 180, price_per_kg: 58.17, price_per_batch: 10.47 },
        { name: "Orris Root", weight_g: 50, price_per_kg: 52.32, price_per_batch: 2.62 },
        { name: "Orange", weight_g: 380, price_per_kg: 3.99, price_per_batch: 1.52 },
        { name: "Lemon", weight_g: 380, price_per_kg: 6.99, price_per_batch: 2.66 },
        { name: "Liquorice", weight_g: 100, price_per_kg: 28.08, price_per_batch: 2.81 },
        { name: "Cardamon", weight_g: 150, price_per_kg: 64.14, price_per_batch: 9.62 },
        { name: "Chamomile", weight_g: 50, price_per_kg: 32.2, price_per_batch: 1.61 }
      ]
    },
    {
      name: "Dry Season Gin",
      total_cost: null,
      last_batch: { volume_l: 199, abv_percent: 81.4, water_l: 205 },
      botanicals: [
        { name: "Juniper", weight_g: 6250, price_per_kg: 40.273, price_per_batch: 251.69 },
        { name: "Coriander Seed", weight_g: 625, price_per_kg: 12.852, price_per_batch: 8.03 },
        { name: "Angelica", weight_g: 167, price_per_kg: 58.17, price_per_batch: 9.71 },
        { name: "Cardamon", weight_g: 83, price_per_kg: 64.14, price_per_batch: 5.32 },
        { name: "Lemongrass", weight_g: 1167, price_per_kg: null, price_per_batch: null },
        { name: "Mandarin", weight_g: 1667, price_per_kg: null, price_per_batch: null },
        { name: "Mandarin Skin", weight_g: 1200, price_per_kg: null, price_per_batch: null },
        { name: "Turmeric", weight_g: 500, price_per_kg: null, price_per_batch: null },
        { name: "Rosella Flower", weight_g: 1667, price_per_kg: null, price_per_batch: null },
        { name: "Holy Basil", weight_g: 167, price_per_kg: null, price_per_batch: null },
        { name: "Thai Basil", weight_g: 1000, price_per_kg: null, price_per_batch: null },
        { name: "Kaffir Lime Leaf", weight_g: 333, price_per_kg: null, price_per_batch: null }
      ]
    },
    {
      name: "Wet Season Gin",
      total_cost: null,
      last_batch: { volume_l: 251, abv_percent: 81.3, water_l: 234 },
      botanicals: [
        { name: "Juniper", weight_g: 6250, price_per_kg: 40.27, price_per_batch: 251.69 },
        { name: "Sawtooth Coriander", weight_g: 625, price_per_kg: null, price_per_batch: null },
        { name: "Angelica", weight_g: 168, price_per_kg: null, price_per_batch: null },
        { name: "Holy Basil", weight_g: 252, price_per_kg: null, price_per_batch: null },
        { name: "Thai Sweet Basil", weight_g: 168, price_per_kg: null, price_per_batch: null },
        { name: "Kaffir Fruit Rind", weight_g: 832, price_per_kg: null, price_per_batch: null },
        { name: "Kaffir Leaves", weight_g: 500, price_per_kg: null, price_per_batch: null },
        { name: "Thai Marigolds", weight_g: 332, price_per_kg: null, price_per_batch: null },
        { name: "Galangal", weight_g: 332, price_per_kg: null, price_per_batch: null },
        { name: "Lemongrass", weight_g: 252, price_per_kg: null, price_per_batch: null },
        { name: "Liquorice Root", weight_g: 84, price_per_kg: 28.08, price_per_batch: 2.36 },
        { name: "Cardamon", weight_g: 84, price_per_kg: 64.14, price_per_batch: 5.39 },
        { name: "Pandanus", weight_g: 108, price_per_kg: null, price_per_batch: null }
      ]
    }
  ]
}

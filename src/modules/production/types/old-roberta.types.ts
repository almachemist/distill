export type OldRobertaProductType = 'Rum' | 'Cane Spirit' | 'Other'

export interface OldRobertaBatch {
  batch_id: string
  product_type: OldRobertaProductType
  fermentation_date?: string | null
  distillation_date?: string | null
  still_used?: string | null // Expect: "Roberta (simple pot still)"
  wash_volume_l?: number | null
  wash_abv_percent?: number | null
  charge_l?: number | null
  hearts_volume_l?: number | null
  hearts_abv_percent?: number | null
  hearts_lal?: number | null
  heads_volume_l?: number | null
  tails_volume_l?: number | null
  notes?: string | null
}

export interface OldRobertaFile {
  batches: OldRobertaBatch[]
}


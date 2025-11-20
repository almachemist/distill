export type TankStatus = 
  | 'empty'
  | 'fresh_distillation'
  | 'settling'
  | 'waiting_to_proof'
  | 'proofed_resting'
  | 'ready_to_bottle'
  | 'bottled_empty'
  | 'cleaning'
  | 'maintenance'

export type TankType = 'fermenter' | 'holding' | 'spirits' | 'storage'

export interface Tank {
  id: string
  organization_id: string
  tank_id: string
  tank_name: string
  tank_type: TankType
  capacity_l: number
  
  // Current contents
  product?: string | null
  current_abv?: number | null
  current_volume_l?: number | null
  status: TankStatus
  notes?: string | null
  
  // Metadata
  last_updated_by?: string | null
  created_at: string
  updated_at: string
}

export interface TankHistoryEntry {
  id: string
  organization_id: string
  tank_id: string
  action: string
  user_name?: string | null
  previous_values?: Record<string, any> | null
  new_values?: Record<string, any> | null
  notes?: string | null
  created_at: string
}

export interface TankUpdateInput {
  product?: string | null
  current_abv?: number | null
  current_volume_l?: number | null
  status?: TankStatus
  notes?: string | null
  last_updated_by?: string
}

export const TANK_STATUS_LABELS: Record<TankStatus, string> = {
  empty: 'Empty',
  fresh_distillation: 'Fresh Distillation',
  settling: 'Settling',
  waiting_to_proof: 'Waiting to Proof Down',
  proofed_resting: 'Proofed Down - Resting',
  ready_to_bottle: 'Ready to Bottle',
  bottled_empty: 'Bottled - Tank Empty',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance'
}

export const TANK_STATUS_COLORS: Record<TankStatus, string> = {
  empty: 'gray',
  fresh_distillation: 'purple',
  settling: 'yellow',
  waiting_to_proof: 'orange',
  proofed_resting: 'blue',
  ready_to_bottle: 'green',
  bottled_empty: 'gray',
  cleaning: 'red',
  maintenance: 'red'
}


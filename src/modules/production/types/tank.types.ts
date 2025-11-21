export type TankStatus =
  | 'empty'
  | 'holding'
  | 'infusing'
  | 'pending_redistillation'
  | 'fresh_distillation'
  | 'settling'
  | 'waiting_to_proof'
  | 'proofed_resting'
  | 'ready_to_bottle'
  | 'bottled_empty'
  | 'cleaning'
  | 'maintenance'
  | 'unavailable'

export type TankType = 'fermenter' | 'holding' | 'spirits' | 'storage' | 'steel' | 'plastic' | 'glass' | 'oak_barrel' | 'other'

export interface Tank {
  id: string
  organization_id: string
  tank_id: string
  tank_name?: string
  name?: string // Alias for tank_name
  tank_type?: TankType
  type?: string // Material type (steel, plastic, etc.)
  capacity_l: number
  capacity?: number // Alias for capacity_l
  has_lid?: boolean

  // Current contents
  product?: string | null
  current_abv?: number | null
  abv?: number | null // Alias for current_abv
  current_volume_l?: number | null
  volume?: number | null // Alias for current_volume_l
  status: TankStatus
  notes?: string | null

  // Batch linking
  batch_id?: string | null
  batch?: string | null

  // Infusion details
  infusion_type?: string | null
  extra_materials?: Record<string, any> | null
  started_on?: string | null
  expected_completion?: string | null

  // Location
  location?: string | null

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
  holding: 'Holding',
  infusing: 'Infusing',
  pending_redistillation: 'Pending Redistillation',
  fresh_distillation: 'Fresh Distillation',
  settling: 'Settling',
  waiting_to_proof: 'Waiting to Proof Down',
  proofed_resting: 'Proofed Down - Resting',
  ready_to_bottle: 'Ready to Bottle',
  bottled_empty: 'Bottled - Tank Empty',
  cleaning: 'Cleaning',
  maintenance: 'Maintenance',
  unavailable: 'Unavailable'
}

export const TANK_STATUS_COLORS: Record<TankStatus, string> = {
  empty: 'gray',
  holding: 'blue',
  infusing: 'purple',
  pending_redistillation: 'orange',
  fresh_distillation: 'purple',
  settling: 'yellow',
  waiting_to_proof: 'orange',
  proofed_resting: 'blue',
  ready_to_bottle: 'green',
  bottled_empty: 'gray',
  cleaning: 'red',
  maintenance: 'red',
  unavailable: 'gray'
}


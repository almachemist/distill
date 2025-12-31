/**
 * Tank Inventory Types
 * 
 * Comprehensive type definitions for distillery tank management system.
 * Tracks tank contents, ABV, volumes, batch links, infusions, and movements.
 */

export type TankType = 'steel' | 'plastic' | 'glass' | 'oak_barrel' | 'other'

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

export type ProductType = 
  | 'gin'
  | 'vodka'
  | 'rum'
  | 'white_rum'
  | 'dark_rum'
  | 'spiced_rum'
  | 'cane_spirit'
  | 'liqueur'
  | 'coffee_liqueur'
  | 'infusion'
  | 'ethanol'
  | 'neutral_spirit'
  | 'other'

export interface InfusionDetails {
  /** Type of infusion (coffee, vanilla, spice, etc.) */
  infusion_type?: string
  /** Extra materials used in infusion */
  extra_materials?: {
    coffee_kg?: number
    vanilla_beans?: number
    spices_kg?: number
    fruit_kg?: number
    [key: string]: number | undefined
  }
  /** Date infusion started */
  started_on?: string
  /** Expected completion date */
  expected_completion?: string
  /** Infusion notes */
  notes?: string
}

export interface TankContents {
  /** Product type in tank */
  product: ProductType | string
  /** Current volume in liters */
  volume_l: number | null
  /** Current ABV percentage */
  abv_percent: number | null
  /** Linked batch ID */
  batch_id?: string | null
  /** Batch name/number */
  batch?: string | null
  /** Current status */
  status: TankStatus
  /** Infusion details (if applicable) */
  infusion?: InfusionDetails
  /** Extra materials (legacy field, use infusion.extra_materials instead) */
  extra_materials?: Record<string, unknown>
  /** Started on date (legacy field, use infusion.started_on instead) */
  started_on?: string
}

export interface Tank {
  /** Unique tank identifier */
  id?: string
  /** Tank ID (e.g., T-330-01, T-615-01) */
  tank_id: string
  /** Tank name (optional, user-friendly) */
  name?: string
  /** Tank capacity in liters */
  capacity_l: number
  /** Tank type */
  type: TankType
  /** Whether tank has a lid */
  has_lid: boolean
  /** Current contents */
  contents: TankContents
  /** Location in distillery */
  location?: string
  /** Organization ID */
  organization_id?: string
  /** Created timestamp */
  created_at?: string
  /** Updated timestamp */
  updated_at?: string
}

export interface TankMovement {
  /** Unique movement ID */
  id?: string
  /** Tank ID */
  tank_id: string
  /** Movement type */
  movement_type: 'fill' | 'drain' | 'transfer_in' | 'transfer_out' | 'adjustment'
  /** Volume change in liters (positive for additions, negative for removals) */
  volume_change_l: number
  /** ABV before movement */
  abv_before?: number
  /** ABV after movement */
  abv_after?: number
  /** Volume before movement */
  volume_before_l?: number
  /** Volume after movement */
  volume_after_l?: number
  /** Linked batch ID */
  batch_id?: string
  /** Reference to source/destination tank (for transfers) */
  reference_tank_id?: string
  /** Movement notes */
  notes?: string
  /** Created by user ID */
  created_by?: string
  /** Organization ID */
  organization_id?: string
  /** Created timestamp */
  created_at?: string
}

export interface TankSummary {
  /** Total number of tanks */
  total_tanks: number
  /** Number of tanks in use */
  tanks_in_use: number
  /** Number of empty tanks */
  empty_tanks: number
  /** Total liquid volume across all tanks (liters) */
  total_volume_l: number
  /** Total capacity across all tanks (liters) */
  total_capacity_l: number
  /** Capacity utilization percentage */
  utilization_percent: number
  /** Tanks by status */
  by_status: Record<TankStatus, number>
  /** Tanks by product type */
  by_product: Record<string, number>
}

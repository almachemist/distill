export interface Barrel {
  id: string
  barrelNumber: string
  spiritType: string
  prevSpirit: string | null
  barrelType: string
  barrelSize: string
  liters: number
  fillDate: string
  location: string
  status: 'Aging' | 'Ready' | 'Emptied' | 'Maintenance' | 'Testing' | 'Less than 2 years' | 'Greater than 2 years' | 'Bottled' | 'Decanted' | 'Blended' | 'Transferred'
  currentVolume: number
  originalVolume: number | null
  abv: number
  notes?: string
  batch?: string
  dateMature?: string
  tastingNotes?: string
  angelsShare?: string
  lastInspection?: string
  organizationId: string
  createdBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBarrelData {
  barrelNumber: string
  spiritType: string
  prevSpirit?: string
  barrelType: string
  barrelSize: string
  liters: number
  fillDate: string
  location: string
  currentVolume: number
  originalVolume: number | null
  abv: number
  notes?: string
}

export interface UpdateBarrelData extends Partial<CreateBarrelData> {
  status?: Barrel['status']
  batch?: Barrel['batch']
}

export interface BarrelMovement {
  id: string
  barrelId: string
  fromLocation: string
  toLocation: string
  movedBy: string
  movedAt: string
  notes?: string
}

export interface BarrelSample {
  id: string
  barrelId: string
  sampleDate: string
  volume: number
  abv?: number
  pH?: number
  temperature?: number
  color?: string
  aroma?: string
  taste?: string
  notes?: string
  sampledBy: string
}

export interface BarrelFilter {
  status?: Barrel['status']
  spiritType?: string
  location?: string
  barrelType?: string
  fillDateFrom?: string
  fillDateTo?: string
}

export interface BarrelStats {
  totalBarrels: number
  activeBarrels: number
  totalVolume: number
  averageAge: number
  byStatus: Record<string, number>
  bySpiritType: Record<string, number>
  byLocation: Record<string, number>
}

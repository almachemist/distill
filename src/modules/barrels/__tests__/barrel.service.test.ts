import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BarrelService } from '../services/barrel.service'
import { createClient } from '@/lib/supabase/client'
import type { CreateBarrelData, UpdateBarrelData, BarrelFilter } from '../types/barrel.types'

vi.mock('@/lib/supabase/client')

describe('BarrelService', () => {
  let barrelService: BarrelService
  let mockSupabaseClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSupabaseClient = {
      from: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    }

    vi.mocked(createClient).mockReturnValue(mockSupabaseClient)
    barrelService = new BarrelService()
  })

  describe('createBarrel', () => {
    it('should create a new barrel', async () => {
      const barrelData: CreateBarrelData = {
        barrelNumber: 'B001',
        spiritType: 'Whiskey',
        barrelType: 'Ex-Bourbon',
        barrelSize: '200L',
        liters: 200,
        fillDate: '2024-01-01',
        location: 'Warehouse A',
        currentVolume: 190,
        originalVolume: 190,
        abv: 62.5,
        notes: 'First fill',
      }

      const mockDbResponse = {
        id: '123',
        barrel_number: 'B001',
        spirit: 'Whiskey',
        prev_spirit: null,
        barrel: 'Ex-Bourbon',
        volume: '190',
        date_filled: '2024-01-01',
        location: 'Warehouse A',
        abv: '62.5',
        notes_comments: 'First fill',
        status: 'Aging',
        organization_id: 'org-123',
        created_by: 'org-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbResponse, error: null }),
      }
      const profilesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profilesChain as any
        return insertChain as any
      })

      const result = await barrelService.createBarrel(barrelData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(result).toMatchObject({
        id: '123',
        barrelNumber: 'B001',
        spiritType: 'Whiskey',
        barrelType: 'Ex-Bourbon',
        status: 'Aging',
        organizationId: 'org-123',
      })
    })

    it('should throw error if barrel creation fails', async () => {
      const barrelData: CreateBarrelData = {
        barrelNumber: 'B001',
        spiritType: 'Whiskey',
        barrelType: 'Ex-Bourbon',
        barrelSize: '200L',
        liters: 200,
        fillDate: '2024-01-01',
        location: 'Warehouse A',
        currentVolume: 190,
        originalVolume: 190,
        abv: 62.5,
      }

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Duplicate barrel number' },
        }),
      }
      const profilesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profilesChain as any
        return insertChain as any
      })
      await expect(barrelService.createBarrel(barrelData)).rejects.toThrow('Duplicate barrel number')
    })
  })

  describe('getBarrels', () => {
    it('should fetch all barrels', async () => {
      const mockDbBarrels = [
        { id: '1', barrel_number: 'B001', spirit: 'Whiskey', status: 'Aging', volume: '190', location: 'A', abv: '60' },
        { id: '2', barrel_number: 'B002', spirit: 'Rum', status: 'Ready', volume: '180', location: 'B', abv: '58' },
      ]

      const listChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDbBarrels, error: null }),
      }
      const profilesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profilesChain as any
        return listChain as any
      })

      const result = await barrelService.getBarrels()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ id: '1', barrelNumber: 'B001', spiritType: 'Whiskey', status: 'Aging' })
      expect(result[1]).toMatchObject({ id: '2', barrelNumber: 'B002', spiritType: 'Rum', status: 'Ready' })
    })

    it('should filter barrels by status', async () => {
      const filter: BarrelFilter = { status: 'Aging' }
      const mockDbBarrels = [
        { id: '1', barrel_number: 'B001', spirit: 'Whiskey', status: 'Aging', volume: '190', location: 'A', abv: '60' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDbBarrels, error: null }),
      }

      const profilesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
      const profilesChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profilesChain2 as any
        return mockChain as any
      })

      const result = await barrelService.getBarrels(filter)

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'Aging')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: '1', barrelNumber: 'B001', spiritType: 'Whiskey', status: 'Aging' })
    })

    it('should filter barrels by multiple criteria', async () => {
      const filter: BarrelFilter = {
        status: 'Aging',
        spiritType: 'Whiskey',
        location: 'Warehouse A',
      }

      const mockDbBarrels = [
        { id: '1', barrel_number: 'B001', spirit: 'Whiskey', status: 'Aging', location: 'Warehouse A', volume: '190', abv: '60' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDbBarrels, error: null }),
      }

      const profilesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profilesChain as any
        return mockChain as any
      })

      const result = await barrelService.getBarrels(filter)

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'Aging')
      expect(mockChain.eq).toHaveBeenCalledWith('spirit', 'Whiskey')
      expect(mockChain.eq).toHaveBeenCalledWith('location', 'Warehouse A')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: '1', barrelNumber: 'B001', spiritType: 'Whiskey', status: 'Aging', location: 'Warehouse A' })
    })
  })

  describe('getBarrelById', () => {
    it('should fetch a barrel by id', async () => {
      const mockDbBarrel = {
        id: '123',
        barrel_number: 'B001',
        spirit: 'Whiskey',
        status: 'Aging',
        volume: '190',
        location: 'Warehouse A',
        abv: '62.5',
        date_filled: '2024-01-01',
      }

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockDbBarrel, error: null }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await barrelService.getBarrelById('123')

      expect(mockChain.eq).toHaveBeenCalledWith('id', '123')
      expect(result).toMatchObject({
        id: '123',
        barrelNumber: 'B001',
        spiritType: 'Whiskey',
        status: 'Aging',
      })
    })

    it('should return null if barrel not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)
      const result = await barrelService.getBarrelById('999')
      expect(result).toBeNull()
    })
  })

  describe('updateBarrel', () => {
    it('should update a barrel', async () => {
      const updateData: UpdateBarrelData = {
        status: 'Ready',
        notes: 'Ready for bottling',
      }

      const mockUpdatedDbBarrel = {
        id: '123',
        barrel_number: 'B001',
        status: 'Ready',
        notes_comments: 'Ready for bottling',
        volume: '190',
        location: 'Warehouse A',
        abv: '62.5',
        date_filled: '2024-01-01',
      }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedDbBarrel, error: null }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await barrelService.updateBarrel('123', updateData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(mockChain.update).toHaveBeenCalledWith({ status: 'Ready', notes_comments: 'Ready for bottling' })
      expect(mockChain.eq).toHaveBeenCalledWith('id', '123')
      expect(result).toMatchObject({ id: '123', barrelNumber: 'B001', status: 'Ready' })
    })

    it('should throw error if update fails', async () => {
      const updateData: UpdateBarrelData = { status: 'Ready' }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      await expect(barrelService.updateBarrel('123', updateData)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteBarrel', () => {
    it('should delete a barrel', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      await barrelService.deleteBarrel('123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(mockChain.delete).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', '123')
    })

    it('should throw error if deletion fails', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Cannot delete barrel with samples' } }),
      }
      mockSupabaseClient.from.mockReturnValue(mockChain)

      await expect(barrelService.deleteBarrel('123')).rejects.toThrow('Cannot delete barrel with samples')
    })
  })

  describe('getBarrelStats', () => {
    it('should calculate barrel statistics', async () => {
      const mockDbBarrels = [
        { id: '1', status: 'Aging', spirit: 'Whiskey', location: 'Warehouse A', volume: '190', date_filled: '2024-01-01' },
        { id: '2', status: 'Aging', spirit: 'Rum', location: 'Warehouse B', volume: '180', date_filled: '2023-01-01' },
        { id: '3', status: 'Ready', spirit: 'Whiskey', location: 'Warehouse A', volume: '185', date_filled: '2023-06-01' },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve: any) => resolve({ data: mockDbBarrels, error: null })),
      }
      const profilesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { organization_id: 'org-123' }, error: null }),
      }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'profiles') return profilesChain as any
        return mockChain as any
      })

      const result = await barrelService.getBarrelStats()

      expect(result.totalBarrels).toBe(3)
      expect(result.activeBarrels).toBe(3)
      expect(result.totalVolume).toBe(555)
      expect(result.byStatus.Aging).toBe(2)
      expect(result.byStatus.Ready).toBe(1)
      expect(result.bySpiritType.Whiskey).toBe(2)
      expect(result.bySpiritType.Rum).toBe(1)
    })
  })
})

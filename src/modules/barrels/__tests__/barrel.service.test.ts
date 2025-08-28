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

      const mockResponse = {
        id: '123',
        ...barrelData,
        status: 'Aging',
        organizationId: 'org-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: mockResponse,
        error: null,
      })

      const result = await barrelService.createBarrel(barrelData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(result).toEqual(mockResponse)
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

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate barrel number' },
      })

      await expect(barrelService.createBarrel(barrelData)).rejects.toThrow('Duplicate barrel number')
    })
  })

  describe('getBarrels', () => {
    it('should fetch all barrels', async () => {
      const mockBarrels = [
        {
          id: '1',
          barrelNumber: 'B001',
          spiritType: 'Whiskey',
          status: 'Aging',
        },
        {
          id: '2',
          barrelNumber: 'B002',
          spiritType: 'Rum',
          status: 'Ready',
        },
      ]

      mockSupabaseClient.from().select().order.mockResolvedValue({
        data: mockBarrels,
        error: null,
      })

      const result = await barrelService.getBarrels()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(result).toEqual(mockBarrels)
    })

    it('should filter barrels by status', async () => {
      const filter: BarrelFilter = { status: 'Aging' }
      const mockBarrels = [
        {
          id: '1',
          barrelNumber: 'B001',
          spiritType: 'Whiskey',
          status: 'Aging',
        },
      ]

      mockSupabaseClient.from().select().eq().order.mockResolvedValue({
        data: mockBarrels,
        error: null,
      })

      const result = await barrelService.getBarrels(filter)

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'Aging')
      expect(result).toEqual(mockBarrels)
    })

    it('should filter barrels by multiple criteria', async () => {
      const filter: BarrelFilter = {
        status: 'Aging',
        spiritType: 'Whiskey',
        location: 'Warehouse A',
      }

      const mockBarrels = [
        {
          id: '1',
          barrelNumber: 'B001',
          spiritType: 'Whiskey',
          status: 'Aging',
          location: 'Warehouse A',
        },
      ]

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBarrels, error: null }),
      }

      mockSupabaseClient.from.mockReturnValue(mockChain)

      const result = await barrelService.getBarrels(filter)

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'Aging')
      expect(mockChain.eq).toHaveBeenCalledWith('spirit_type', 'Whiskey')
      expect(mockChain.eq).toHaveBeenCalledWith('location', 'Warehouse A')
      expect(result).toEqual(mockBarrels)
    })
  })

  describe('getBarrelById', () => {
    it('should fetch a barrel by id', async () => {
      const mockBarrel = {
        id: '123',
        barrelNumber: 'B001',
        spiritType: 'Whiskey',
        status: 'Aging',
      }

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: mockBarrel,
        error: null,
      })

      const result = await barrelService.getBarrelById('123')

      expect(mockChain.eq).toHaveBeenCalledWith('id', '123')
      expect(result).toEqual(mockBarrel)
    })

    it('should return null if barrel not found', async () => {
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

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

      const mockUpdatedBarrel = {
        id: '123',
        barrelNumber: 'B001',
        status: 'Ready',
        notes: 'Ready for bottling',
      }

      mockSupabaseClient.from().update().eq().select().single.mockResolvedValue({
        data: mockUpdatedBarrel,
        error: null,
      })

      const result = await barrelService.updateBarrel('123', updateData)

      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateData)
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', '123')
      expect(result).toEqual(mockUpdatedBarrel)
    })

    it('should throw error if update fails', async () => {
      const updateData: UpdateBarrelData = { status: 'Ready' }

      mockSupabaseClient.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      })

      await expect(barrelService.updateBarrel('123', updateData)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteBarrel', () => {
    it('should delete a barrel', async () => {
      mockSupabaseClient.from().delete().eq.mockResolvedValue({
        data: null,
        error: null,
      })

      await barrelService.deleteBarrel('123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('tracking')
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled()
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', '123')
    })

    it('should throw error if deletion fails', async () => {
      mockSupabaseClient.from().delete().eq.mockResolvedValue({
        data: null,
        error: { message: 'Cannot delete barrel with samples' },
      })

      await expect(barrelService.deleteBarrel('123')).rejects.toThrow('Cannot delete barrel with samples')
    })
  })

  describe('getBarrelStats', () => {
    it('should calculate barrel statistics', async () => {
      const mockBarrels = [
        {
          id: '1',
          status: 'Aging',
          spiritType: 'Whiskey',
          location: 'Warehouse A',
          currentVolume: 190,
          fillDate: '2024-01-01',
        },
        {
          id: '2',
          status: 'Aging',
          spiritType: 'Rum',
          location: 'Warehouse B',
          currentVolume: 180,
          fillDate: '2023-01-01',
        },
        {
          id: '3',
          status: 'Ready',
          spiritType: 'Whiskey',
          location: 'Warehouse A',
          currentVolume: 185,
          fillDate: '2023-06-01',
        },
      ]

      mockSupabaseClient.from().select.mockResolvedValue({
        data: mockBarrels,
        error: null,
      })

      const result = await barrelService.getBarrelStats()

      expect(result.totalBarrels).toBe(3)
      expect(result.activeBarrels).toBe(2)
      expect(result.totalVolume).toBe(555)
      expect(result.byStatus.Aging).toBe(2)
      expect(result.byStatus.Ready).toBe(1)
      expect(result.bySpiritType.Whiskey).toBe(2)
      expect(result.bySpiritType.Rum).toBe(1)
    })
  })
})
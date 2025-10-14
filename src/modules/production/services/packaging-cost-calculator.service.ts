// packaging-cost-calculator.service.ts
import { PackagingItem, PackagingCostBreakdown, BottlePackaging } from '../types/packaging.types'
import { packagingItems, ginPackagingConfigs } from '../data/packaging-items.data'

export class PackagingCostCalculator {
  /**
   * Calculate packaging cost for a specific bottle configuration
   */
  static calculatePackagingCost(packaging: BottlePackaging): PackagingCostBreakdown {
    const bottle = packagingItems.find(item => item.id === packaging.bottleId)
    const closure = packagingItems.find(item => item.id === packaging.closureId)
    
    const labels = packaging.labelIds.map(id => 
      packagingItems.find(item => item.id === id)
    ).filter(Boolean) as PackagingItem[]
    
    const box = packaging.boxId ? 
      packagingItems.find(item => item.id === packaging.boxId) : undefined
    
    const inserts = packaging.insertIds?.map(id => 
      packagingItems.find(item => item.id === id)
    ).filter(Boolean) as PackagingItem[] || []
    
    const seals = packaging.sealIds?.map(id => 
      packagingItems.find(item => item.id === id)
    ).filter(Boolean) as PackagingItem[] || []

    const bottleCost = bottle?.unitCostAUD || 0
    const closureCost = closure?.unitCostAUD || 0
    const labelCost = labels.reduce((sum, label) => sum + label.unitCostAUD, 0)
    const boxCost = box?.unitCostAUD || 0
    const insertCost = inserts.reduce((sum, insert) => sum + insert.unitCostAUD, 0)
    const sealCost = seals.reduce((sum, seal) => sum + seal.unitCostAUD, 0)

    const totalCost = bottleCost + closureCost + labelCost + boxCost + insertCost + sealCost

    return {
      bottleCost,
      closureCost,
      labelCost,
      boxCost,
      insertCost,
      sealCost,
      totalCost
    }
  }

  /**
   * Calculate packaging cost for a specific gin product
   */
  static calculateGinPackagingCost(ginType: keyof typeof ginPackagingConfigs): PackagingCostBreakdown {
    const config = ginPackagingConfigs[ginType]
    return this.calculatePackagingCost(config)
  }

  /**
   * Calculate packaging cost for a batch of bottles
   */
  static calculateBatchPackagingCost(
    ginType: keyof typeof ginPackagingConfigs, 
    bottleCount: number
  ): {
    costPerBottle: PackagingCostBreakdown
    totalBatchCost: number
    costBreakdown: {
      bottles: number
      closures: number
      labels: number
      boxes: number
      inserts: number
      seals: number
      total: number
    }
  } {
    const costPerBottle = this.calculateGinPackagingCost(ginType)
    const totalBatchCost = costPerBottle.totalCost * bottleCount

    return {
      costPerBottle,
      totalBatchCost,
      costBreakdown: {
        bottles: costPerBottle.bottleCost * bottleCount,
        closures: costPerBottle.closureCost * bottleCount,
        labels: costPerBottle.labelCost * bottleCount,
        boxes: costPerBottle.boxCost * bottleCount,
        inserts: costPerBottle.insertCost * bottleCount,
        seals: costPerBottle.sealCost * bottleCount,
        total: totalBatchCost
      }
    }
  }

  /**
   * Calculate packaging cost per LAL (Litres of Absolute Alcohol)
   */
  static calculatePackagingCostPerLAL(
    ginType: keyof typeof ginPackagingConfigs,
    bottlingABV: number = 40,
    bottleSizeL: number = 0.7
  ): {
    costPerBottle: PackagingCostBreakdown
    costPerLAL: number
    bottlesPerLAL: number
  } {
    const costPerBottle = this.calculateGinPackagingCost(ginType)
    const laaPerBottle = bottleSizeL * (bottlingABV / 100)
    const bottlesPerLAL = 1 / laaPerBottle
    const costPerLAL = costPerBottle.totalCost * bottlesPerLAL

    return {
      costPerBottle,
      costPerLAL,
      bottlesPerLAL
    }
  }

  /**
   * Get all available packaging items by category
   */
  static getPackagingItemsByCategory(category: PackagingItem['category']): PackagingItem[] {
    return packagingItems.filter(item => item.category === category)
  }

  /**
   * Update packaging item cost
   */
  static updatePackagingItemCost(itemId: string, newCost: number): boolean {
    const item = packagingItems.find(item => item.id === itemId)
    if (item) {
      item.unitCostAUD = newCost
      return true
    }
    return false
  }

  /**
   * Add new packaging item
   */
  static addPackagingItem(item: Omit<PackagingItem, 'id'> & { id?: string }): PackagingItem {
    const newItem: PackagingItem = {
      id: item.id || `item-${Date.now()}`,
      ...item
    }
    packagingItems.push(newItem)
    return newItem
  }
}




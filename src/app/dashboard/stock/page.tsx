'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface InventoryItem {
  id: string
  name: string
  category: string
  current_stock: number
  uom: string
}

interface CategoryGroup {
  name: string
  items: InventoryItem[]
  icon: string
  color: string
}

export default function StockPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInventory() {
      const supabase = createClient()

      // Get all items with their current stock levels
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, name, category, default_uom')
        .order('name')

      if (itemsError) {
        console.error('Error fetching items:', itemsError)
        setLoading(false)
        return
      }

      // Get stock levels for each item
      const inventoryData: InventoryItem[] = []

      for (const item of items) {
        const { data: txns, error: txnsError } = await supabase
          .from('inventory_txns')
          .select('quantity, txn_type')
          .eq('item_id', item.id)

        if (txnsError) {
          console.error(`Error fetching transactions for ${item.name}:`, txnsError)
          continue
        }

        // Calculate current stock
        let currentStock = 0
        for (const txn of txns) {
          if (txn.txn_type === 'RECEIVE' || txn.txn_type === 'PRODUCE' || txn.txn_type === 'ADJUST') {
            currentStock += Number(txn.quantity)
          } else if (txn.txn_type === 'CONSUME' || txn.txn_type === 'DESTROY') {
            currentStock -= Number(txn.quantity)
          }
        }

        inventoryData.push({
          id: item.id,
          name: item.name,
          category: item.category || 'Unknown',
          current_stock: currentStock,
          uom: item.default_uom
        })
      }

      setInventory(inventoryData)
      setLoading(false)
    }

    loadInventory()
  }, [])

  // Categorize items
  const labels = inventory.filter(item => item.category === 'Labels' || item.name.includes('Label'))
  const bottles = inventory.filter(item =>
    item.category === 'Bottles' ||
    item.name.includes('Bottle') ||
    (item.name.includes('ml') && !item.name.includes('Label') && !item.name.includes('Cork') && !item.name.includes('Cap'))
  )
  const packaging = inventory.filter(item =>
    item.category === 'Packaging' ||
    item.name.includes('Cork') ||
    item.name.includes('Cap') ||
    item.name.includes('Sleeve') ||
    item.name.includes('Carton') ||
    item.name.includes('Box')
  )
  const botanicals = inventory.filter(item =>
    item.category === 'Botanicals' ||
    item.name.includes('Ethanol') ||
    item.name.includes('Sugar') ||
    item.name.includes('Water')
  )

  const categories: CategoryGroup[] = [
    { name: 'Labels', items: labels, icon: '🏷️', color: 'bg-blue-500' },
    { name: 'Bottles', items: bottles, icon: '🍾', color: 'bg-green-500' },
    { name: 'Packaging', items: packaging, icon: '📦', color: 'bg-amber-500' },
    { name: 'Botanicals', items: botanicals, icon: '🌿', color: 'bg-purple-500' },
  ]

  const totalUnits = inventory.reduce((sum, item) => sum + item.current_stock, 0)
  const lowStockCount = inventory.filter(item => item.current_stock < 100).length
  const criticalStockCount = inventory.filter(item => item.current_stock === 0).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading inventory data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time inventory levels and tracking
          </p>
        </div>

        {/* Summary Cards */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl shadow-card border border-border bg-surface transition-shadow duration-200">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Items</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{inventory.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Unique SKUs</p>
        </div>

        <div className="p-5 rounded-xl shadow-card border border-border bg-surface transition-shadow duration-200">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Inventory</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{totalUnits.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Units in warehouse</p>
        </div>

        <div className="p-5 rounded-xl shadow-card border border-border bg-surface transition-shadow duration-200">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Low Inventory</p>
          <p className="text-3xl font-semibold text-warning mt-2">{lowStockCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Below 100 units</p>
        </div>

        <div className="p-5 rounded-xl shadow-card border border-border bg-surface transition-shadow duration-200">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Out of Inventory</p>
          <p className="text-3xl font-semibold text-destructive mt-2">{criticalStockCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Items at 0</p>
        </div>
      </div>

        {/* Inventory by Category */}
        <Tabs defaultValue="labels" className="w-full">
          <TabsList className="bg-background border border-border p-1 rounded-xl inline-flex gap-1">
            <TabsTrigger
              value="labels"
              className="px-6 py-2 rounded-lg text-foreground hover:bg-accent data-[state=active]:bg-copper data-[state=active]:text-white transition-all duration-150"
            >
              Labels
            </TabsTrigger>
            <TabsTrigger
              value="bottles"
              className="px-6 py-2 rounded-lg text-foreground hover:bg-accent data-[state=active]:bg-copper data-[state=active]:text-white transition-all duration-150"
            >
              Bottles
            </TabsTrigger>
            <TabsTrigger
              value="packaging"
              className="px-6 py-2 rounded-lg text-foreground hover:bg-accent data-[state=active]:bg-copper data-[state=active]:text-white transition-all duration-150"
            >
              Packaging
            </TabsTrigger>
            <TabsTrigger
              value="botanicals"
              className="px-6 py-2 rounded-lg text-foreground hover:bg-accent data-[state=active]:bg-copper data-[state=active]:text-white transition-all duration-150"
            >
              Botanicals
            </TabsTrigger>
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.name.toLowerCase()} value={category.name.toLowerCase()} className="mt-6">
              <div className="bg-surface rounded-xl shadow-card border border-border overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-accent to-surface">
                  <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Items</p>
                      <p className="text-sm font-semibold text-foreground">{category.items.length}</p>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Units</p>
                      <p className="text-sm font-semibold text-foreground">{category.items.reduce((sum, item) => sum + item.current_stock, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-accent">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Inventory Level
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {category.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                            No items in this category
                          </td>
                        </tr>
                      ) : (
                        category.items
                          .sort((a, b) => b.current_stock - a.current_stock)
                          .map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-background transition-colors duration-150"
                            >
                              <td className="px-6 py-4 text-sm text-foreground font-medium">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                <span className="inline-flex px-2 py-1 rounded-md bg-accent text-foreground text-xs font-medium">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-semibold text-foreground tabular-nums">
                                {item.current_stock.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-right">
                                {item.current_stock === 0 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-destructive text-white text-xs font-semibold">
                                    Empty
                                  </span>
                                ) : item.current_stock < 100 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-destructive text-white text-xs font-semibold">
                                    Critical
                                  </span>
                                ) : item.current_stock < 500 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-warning text-white text-xs font-semibold">
                                    Low
                                  </span>
                                ) : item.current_stock < 1000 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-copper/10 text-foreground text-xs font-semibold">
                                    Adequate
                                  </span>
                                ) : (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-success text-white text-xs font-semibold">
                                    Healthy
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
    </div>
  )
}

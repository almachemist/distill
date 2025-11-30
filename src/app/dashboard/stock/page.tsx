import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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

async function getInventoryData() {
  const supabase = await createClient()

  // Get all items with their current stock levels
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, name, category, default_uom')
    .order('name')

  if (itemsError) {
    console.error('Error fetching items:', itemsError)
    return []
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

  return inventoryData
}

export default async function StockPage() {
  const inventory = await getInventoryData()

  // Categorize items
  const labels = inventory.filter(item => item.name.includes('Label'))
  const bottles = inventory.filter(item =>
    item.name.includes('Bottle') ||
    (item.name.includes('ml') && !item.name.includes('Label') && !item.name.includes('Cork') && !item.name.includes('Cap'))
  )
  const packaging = inventory.filter(item =>
    item.name.includes('Cork') ||
    item.name.includes('Cap') ||
    item.name.includes('Sleeve') ||
    item.name.includes('Carton') ||
    item.name.includes('Box')
  )
  const rawMaterials = inventory.filter(item =>
    item.name.includes('Ethanol') ||
    item.name.includes('Botanical') ||
    item.name.includes('Sugar') ||
    item.name.includes('Water')
  )

  const categories: CategoryGroup[] = [
    { name: 'Labels', items: labels, icon: '🏷️', color: 'bg-blue-500' },
    { name: 'Bottles', items: bottles, icon: '🍾', color: 'bg-green-500' },
    { name: 'Packaging', items: packaging, icon: '📦', color: 'bg-amber-500' },
    { name: 'Raw Materials', items: rawMaterials, icon: '🌿', color: 'bg-purple-500' },
  ]

  const totalUnits = inventory.reduce((sum, item) => sum + item.current_stock, 0)
  const lowStockCount = inventory.filter(item => item.current_stock < 100).length
  const criticalStockCount = inventory.filter(item => item.current_stock === 0).length

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">Inventory</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time inventory levels and tracking
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl shadow-sm border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Items</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">{inventory.length}</p>
            <p className="text-xs text-neutral-400 mt-1">Unique SKUs</p>
          </div>

          <div className="p-5 rounded-xl shadow-sm border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Inventory</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">{totalUnits.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1">Units in warehouse</p>
          </div>

          <div className="p-5 rounded-xl shadow-sm border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Low Inventory</p>
            <p className="text-3xl font-semibold text-orange-600 mt-2">{lowStockCount}</p>
            <p className="text-xs text-neutral-400 mt-1">Below 100 units</p>
          </div>

          <div className="p-5 rounded-xl shadow-sm border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Out of Inventory</p>
            <p className="text-3xl font-semibold text-red-600 mt-2">{criticalStockCount}</p>
            <p className="text-xs text-neutral-400 mt-1">Items at 0</p>
          </div>
        </div>

        {/* Inventory by Category */}
        <Tabs defaultValue="labels" className="w-full">
          <TabsList className="bg-neutral-100 p-1 rounded-xl inline-flex gap-1">
            <TabsTrigger
              value="labels"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-150"
            >
              Labels
            </TabsTrigger>
            <TabsTrigger
              value="bottles"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-150"
            >
              Bottles
            </TabsTrigger>
            <TabsTrigger
              value="packaging"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-150"
            >
              Packaging
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-150"
            >
              Materials
            </TabsTrigger>
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.name.toLowerCase()} value={category.name.toLowerCase()} className="mt-6">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
                  <h3 className="text-lg font-semibold text-neutral-900">{category.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Items</p>
                      <p className="text-sm font-semibold text-neutral-900">{category.items.length}</p>
                    </div>
                    <div className="h-8 w-px bg-neutral-200"></div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Units</p>
                      <p className="text-sm font-semibold text-neutral-900">{category.items.reduce((sum, item) => sum + item.current_stock, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Inventory Level
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 bg-white">
                      {category.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-sm text-neutral-400">
                            No items in this category
                          </td>
                        </tr>
                      ) : (
                        category.items
                          .sort((a, b) => b.current_stock - a.current_stock)
                          .map((item, index) => (
                            <tr
                              key={item.id}
                              className={`hover:bg-neutral-50 transition-colors duration-150 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-neutral-25'
                              }`}
                            >
                              <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-neutral-500">
                                <span className="inline-flex px-2 py-1 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-right font-semibold text-neutral-900 tabular-nums">
                                {item.current_stock.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-right">
                                {item.current_stock === 0 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold">
                                    Empty
                                  </span>
                                ) : item.current_stock < 100 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                                    Critical
                                  </span>
                                ) : item.current_stock < 500 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-semibold">
                                    Low
                                  </span>
                                ) : item.current_stock < 1000 ? (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                                    Adequate
                                  </span>
                                ) : (
                                  <span className="inline-flex px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
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
    </div>
  )
}


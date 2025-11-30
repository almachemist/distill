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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📊 Inventory Management</h1>
        <p className="text-muted-foreground">
          Real-time stock levels and inventory tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique SKUs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <span className="text-2xl">🏭</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Units in warehouse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items below 100 units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <span className="text-2xl">🚨</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items at 0 stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by Category */}
      <Tabs defaultValue="labels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="labels">
            🏷️ Labels ({labels.length})
          </TabsTrigger>
          <TabsTrigger value="bottles">
            🍾 Bottles ({bottles.length})
          </TabsTrigger>
          <TabsTrigger value="packaging">
            📦 Packaging ({packaging.length})
          </TabsTrigger>
          <TabsTrigger value="materials">
            🌿 Materials ({rawMaterials.length})
          </TabsTrigger>
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.name.toLowerCase()} value={category.name.toLowerCase()}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                </CardTitle>
                <CardDescription>
                  {category.items.length} items • {category.items.reduce((sum, item) => sum + item.current_stock, 0).toLocaleString()} total units
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[50%]">Product Name</TableHead>
                        <TableHead className="text-center">Category</TableHead>
                        <TableHead className="text-right">Stock Level</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No items in this category
                          </TableCell>
                        </TableRow>
                      ) : (
                        category.items
                          .sort((a, b) => b.current_stock - a.current_stock)
                          .map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {item.current_stock.toLocaleString()} {item.uom}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.current_stock === 0 ? (
                                  <Badge variant="destructive">Out of Stock</Badge>
                                ) : item.current_stock < 100 ? (
                                  <Badge variant="default" className="bg-orange-600">Low</Badge>
                                ) : item.current_stock < 500 ? (
                                  <Badge variant="default" className="bg-amber-600">Medium</Badge>
                                ) : item.current_stock < 1000 ? (
                                  <Badge variant="default" className="bg-blue-600">Good</Badge>
                                ) : (
                                  <Badge variant="default" className="bg-green-600">High</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}


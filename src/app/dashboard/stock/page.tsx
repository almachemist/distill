import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface InventoryItem {
  id: string
  name: string
  category: string
  current_stock: number
  uom: string
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

  // Group by brand
  const devilsThumb = inventory.filter(item =>
    !item.name.includes('Merchant Mae')
  )

  const merchantMae = inventory.filter(item => item.name.includes('Merchant Mae'))

  const totalUnits = inventory.reduce((sum, item) => sum + item.current_stock, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Inventory</h1>
        <p className="text-muted-foreground">
          Current stock levels as of 13 November 2025
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <span className="text-2xl">🏭</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Bottles & units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <span className="text-2xl">🏷️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Devils Thumb & Merchant Mae
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Devils Thumb Stock */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Devils Thumb Distillery</CardTitle>
          <CardDescription>
            Premium craft spirits - {devilsThumb.reduce((sum, item) => sum + item.current_stock, 0).toLocaleString()} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devilsThumb.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.current_stock.toLocaleString()} {item.uom}</TableCell>
                  <TableCell className="text-right">
                    {item.current_stock > 500 ? (
                      <Badge variant="default" className="bg-green-600">High</Badge>
                    ) : item.current_stock > 200 ? (
                      <Badge variant="default" className="bg-amber-600">Medium</Badge>
                    ) : item.current_stock > 50 ? (
                      <Badge variant="default" className="bg-orange-600">Low</Badge>
                    ) : (
                      <Badge variant="destructive">Critical</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Merchant Mae Stock */}
      <Card>
        <CardHeader>
          <CardTitle>🏴‍☠️ Merchant Mae</CardTitle>
          <CardDescription>
            Value spirits range - {merchantMae.reduce((sum, item) => sum + item.current_stock, 0).toLocaleString()} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantMae.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.current_stock.toLocaleString()} {item.uom}</TableCell>
                  <TableCell className="text-right">
                    {item.current_stock > 500 ? (
                      <Badge variant="default" className="bg-green-600">High</Badge>
                    ) : item.current_stock > 200 ? (
                      <Badge variant="default" className="bg-amber-600">Medium</Badge>
                    ) : item.current_stock > 50 ? (
                      <Badge variant="default" className="bg-orange-600">Low</Badge>
                    ) : (
                      <Badge variant="destructive">Critical</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


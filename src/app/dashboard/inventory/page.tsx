'use client'

import InventoryManager from '@/modules/inventory/components/InventoryManager'

export default function InventoryPage() {
  return <InventoryManager />

}



/*


  // Mock inventory data
  const inventoryItems = [
    // Raw Materials
    { id: '1', name: 'Ethanol 80.6%', category: 'raw', type: 'ethanol', quantity: 850, unit: 'L', minThreshold: 50, lastUpdated: '2024-01-15' },
    { id: '2', name: 'Ethanol 82%', category: 'raw', type: 'ethanol', quantity: 1200, unit: 'L', minThreshold: 50, lastUpdated: '2024-01-14' },
    { id: '3', name: 'Neutral Grain Spirit', category: 'raw', type: 'ethanol', quantity: 2000, unit: 'L', minThreshold: 100, lastUpdated: '2024-01-13' },
    { id: '4', name: 'Water', category: 'raw', type: 'water', quantity: 5000, unit: 'L', minThreshold: 1000, lastUpdated: '2024-01-12' },
    { id: '5', name: 'Juniper', category: 'raw', type: 'botanical', quantity: 12.5, unit: 'kg', minThreshold: 3, lastUpdated: '2024-01-11' },
    { id: '6', name: 'Coriander', category: 'raw', type: 'botanical', quantity: 8.2, unit: 'kg', minThreshold: 2, lastUpdated: '2024-01-10' },
    { id: '7', name: 'Angelica', category: 'raw', type: 'botanical', quantity: 1.2, unit: 'kg', minThreshold: 2, lastUpdated: '2024-01-09' },
    { id: '8', name: 'Lemon Myrtle', category: 'raw', type: 'botanical', quantity: 0.8, unit: 'kg', minThreshold: 1, lastUpdated: '2024-01-08' },
    { id: '9', name: 'Pepperberry', category: 'raw', type: 'botanical', quantity: 0.3, unit: 'kg', minThreshold: 0.5, lastUpdated: '2024-01-07' },

    // Packaging Materials
    { id: '10', name: '700ml Bottle (Clear)', category: 'packaging', type: 'bottle', quantity: 1200, unit: 'units', minThreshold: 500, lastUpdated: '2024-01-15' },
    { id: '11', name: '200ml Bottle', category: 'packaging', type: 'bottle', quantity: 800, unit: 'units', minThreshold: 200, lastUpdated: '2024-01-14' },
    { id: '12', name: 'Bottle Cork', category: 'packaging', type: 'closure', quantity: 1500, unit: 'units', minThreshold: 1000, lastUpdated: '2024-01-13' },
    { id: '13', name: 'Cap (Screw Top)', category: 'packaging', type: 'closure', quantity: 2000, unit: 'units', minThreshold: 1000, lastUpdated: '2024-01-12' },
    { id: '14', name: 'Label (Front)', category: 'packaging', type: 'label', quantity: 3000, unit: 'units', minThreshold: 2000, lastUpdated: '2024-01-11' },
    { id: '15', name: 'Label (Back)', category: 'packaging', type: 'label', quantity: 2800, unit: 'units', minThreshold: 2000, lastUpdated: '2024-01-10' },
    { id: '16', name: 'Gift Box (1 Bottle)', category: 'packaging', type: 'box', quantity: 150, unit: 'units', minThreshold: 200, lastUpdated: '2024-01-09' },
    { id: '17', name: 'Carton (6 Bottles)', category: 'packaging', type: 'box', quantity: 80, unit: 'units', minThreshold: 100, lastUpdated: '2024-01-08' },

    // Finished Products
    { id: '18', name: 'Signature Dry Gin (Traditional)', category: 'product', type: 'gin', quantity: 142, unit: 'L', minThreshold: 20, lastUpdated: '2024-01-15', notes: 'Batch #SDG-2024-001' },
    { id: '19', name: 'Navy Strength Gin', category: 'product', type: 'gin', quantity: 85, unit: 'L', minThreshold: 15, lastUpdated: '2024-01-14', notes: 'Batch #NSG-2024-002' },
    { id: '20', name: 'Rainforest Gin (42%)', category: 'product', type: 'gin', quantity: 60, unit: 'L', minThreshold: 20, lastUpdated: '2024-01-13', notes: 'Batch #RFG-2024-003' },
    { id: '21', name: 'MM Gin', category: 'product', type: 'gin', quantity: 95, unit: 'L', minThreshold: 25, lastUpdated: '2024-01-12', notes: 'Batch #MMG-2024-004' },
    { id: '22', name: 'Dry Season Gin (40%)', category: 'product', type: 'gin', quantity: 75, unit: 'L', minThreshold: 20, lastUpdated: '2024-01-11', notes: 'Batch #DSG-2024-005' },
    { id: '23', name: 'Wet Season Gin (42%)', category: 'product', type: 'gin', quantity: 0, unit: 'L', minThreshold: 20, lastUpdated: '2024-01-10', notes: 'Out of stock - awaiting bottling' },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (item: any) => {
    const isLow = item.quantity <= item.minThreshold
    const isOut = item.quantity === 0

    if (isOut) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">⚠️ OUT</span>
    }

    if (isLow) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⚠️ LOW</span>
    }

    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ OK</span>
  }

  const getLowStockItems = () => {
    return inventoryItems.filter(item => item.quantity <= item.minThreshold)
  }

  const filteredItems = inventoryItems.filter(item => item.category === activeTab)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {'/* Header * /'}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Production-focused inventory with simplified categories</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">
            Seed Complete Inventory
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {'/* Low Stock Banner * /'}
      {getLowStockItems().length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                ⚠️ Stock Alert: {getLowStockItems().length} items need attention
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside ml-4">
                  {getLowStockItems().slice(0, 5).map(item => (
                    <li key={item.id}>
                      {item.name} ({item.quantity} {item.unit}, min: {item.minThreshold})
                    </li>
                  ))}
                  {getLowStockItems().length > 5 && <li>...and {getLowStockItems().length - 5} more</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {'/* Category Tabs * /'}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'raw', label: 'Raw Materials', count: inventoryItems.filter(i => i.category === 'raw').length },
            { key: 'packaging', label: 'Packaging', count: inventoryItems.filter(i => i.category === 'packaging').length },
            { key: 'product', label: 'Finished Products', count: inventoryItems.filter(i => i.category === 'product').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {'/* Inventory Table * /'}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab === 'raw' ? 'Raw Materials' : activeTab === 'packaging' ? 'Packaging Materials' : 'Finished Products'}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredItems.length} items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{item.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.quantity.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.minThreshold.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No items found in this category</p>
          </div>
        )}
      </div>

      {'/* Instructions * /'}
      <div className="bg-beige border border-copper-30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-graphite mb-2">Simplified Inventory System</h3>
        <p className="text-graphite/70 text-sm mb-4">
          This system organizes your inventory into 3 production-focused categories: Raw Materials, Packaging, and Finished Products.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-copper rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-graphite">Raw Materials: Spirits, botanicals, water</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-copper rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
            <span className="text-graphite">Packaging: Bottles, labels, closures, boxes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-copper rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
            <span className="text-graphite">Finished Products: Your gin varieties</span>
          </div>
        </div>
      </div>
    </div>
  )
}

*/

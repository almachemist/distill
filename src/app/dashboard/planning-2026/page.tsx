import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import completePlan from '@/../data/production_plan_2026_complete.json'

interface ProductPlan {
  product_name: string
  sku_code: string
  brand: string
  sales_2025_actual: number
  sales_2025_value: number
  avg_monthly_sales: number
  sales_2026_projected: number
  current_stock_nov_13: number
  stock_after_dec_sales: number
  production_needed_units: number
  bottles_per_batch: number
  batches_needed: number
  batches_needed_rounded: number
  total_production_units: number
  months_of_stock_current: number
  months_of_stock_after_production: number
  safety_buffer_months: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SUFFICIENT'
  recommended_quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'NONE'
  recommended_month: string
  notes: string[]
  production_type: 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR' | 'WHISKY'
  equipment_needed: string[]
}

interface QuarterlySchedule {
  quarter: string
  months: string[]
  total_batches: number
  total_units: number
  products: Array<{
    product: string
    batches: number
    units: number
    priority: string
  }>
  equipment_usage: {
    gin_still_days: number
    rum_still_days: number
    fermentation_tanks: number
  }
}

interface CompletePlanData {
  generated_at: string
  assumptions: {
    growth_rate: number
    safety_buffer_months: number
    batch_production_days: number
  }
  summary: {
    total_products: number
    products_needing_production: number
    total_batches_2026: number
    total_units_2026: number
    total_sales_2025: number
    projected_sales_2026: number
    by_priority: {
      critical: number
      high: number
      medium: number
      low: number
      sufficient: number
    }
    by_production_type: {
      gin: number
      rum: number
      vodka: number
      cane_spirit: number
      liqueur: number
    }
  }
  quarterly_schedule: QuarterlySchedule[]
  product_plans: ProductPlan[]
}

export default function Planning2026Page() {
  const data = completePlan as CompletePlanData

  // Group by brand
  const devilsThumb = data.product_plans.filter(p => p.brand === 'Devils Thumb')
  const merchantMae = data.product_plans.filter(p => p.brand === 'Merchant Mae')

  // Get Q1 products (urgent)
  const q1Products = data.product_plans.filter(p => p.recommended_quarter === 'Q1')
  const criticalProducts = data.product_plans.filter(p => p.priority === 'CRITICAL')
  const highProducts = data.product_plans.filter(p => p.priority === 'HIGH')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-700 text-white'
      case 'HIGH': return 'bg-red-600 text-white'
      case 'MEDIUM': return 'bg-orange-600 text-white'
      case 'LOW': return 'bg-yellow-600 text-white'
      default: return 'bg-green-600 text-white'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">2026 Production Planning</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis based on 2025 sales, current stock, and production history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2025 Sales</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_sales_2025)}</div>
            <p className="text-xs text-muted-foreground">
              2026 Projected: {formatCurrency(data.summary.projected_sales_2026)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Batches Needed</CardTitle>
            <span className="text-2xl">🏭</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total_batches_2026}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.total_units_2026.toLocaleString()} units to produce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q1 Production</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.quarterly_schedule[0].total_batches}</div>
            <p className="text-xs text-muted-foreground">
              batches in Jan-Mar 2026
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Products</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.summary.by_priority.critical + data.summary.by_priority.high}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.by_priority.critical} CRITICAL + {data.summary.by_priority.high} HIGH
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CRITICAL & HIGH Priority - Urgent Production */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">🚨 URGENT - Q1 2026 Production Required</CardTitle>
          <CardDescription>
            These products need immediate production in January-February 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Months Left</TableHead>
                <TableHead className="text-right">Batches Needed</TableHead>
                <TableHead className="text-right">Units to Produce</TableHead>
                <TableHead className="text-right">Bottles/Batch</TableHead>
                <TableHead className="text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...criticalProducts, ...highProducts].map((product) => (
                <TableRow key={product.sku_code} className={product.priority === 'CRITICAL' ? 'bg-red-100' : ''}>
                  <TableCell className="font-medium">
                    {product.product_name}
                    <div className="text-xs text-muted-foreground">{product.production_type}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock_after_dec_sales}
                    <div className="text-xs text-muted-foreground">
                      from {product.current_stock_nov_13}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-red-600 font-bold">
                      {product.months_of_stock_current.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {product.batches_needed_rounded}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {product.total_production_units.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {product.bottles_per_batch}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={getPriorityColor(product.priority)}>
                      {product.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 p-4 bg-white rounded border border-red-200">
            <h4 className="font-semibold mb-2">Q1 2026 Summary:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Batches</div>
                <div className="text-2xl font-bold">{data.quarterly_schedule[0].total_batches}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Units</div>
                <div className="text-2xl font-bold">{data.quarterly_schedule[0].total_units.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Equipment Days</div>
                <div className="text-lg font-bold">
                  Gin: {data.quarterly_schedule[0].equipment_usage.gin_still_days}d |
                  Rum: {data.quarterly_schedule[0].equipment_usage.rum_still_days}d
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Production Priority Overview</CardTitle>
          <CardDescription>
            All products categorized by urgency (Growth assumption: +{(data.assumptions.growth_rate * 100).toFixed(0)}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-700">{data.summary.by_priority.critical}</div>
              <div className="text-sm text-muted-foreground">CRITICAL</div>
              <div className="text-xs text-muted-foreground mt-1">&lt; 1 month stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{data.summary.by_priority.high}</div>
              <div className="text-sm text-muted-foreground">HIGH</div>
              <div className="text-xs text-muted-foreground mt-1">1-2 months stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{data.summary.by_priority.medium}</div>
              <div className="text-sm text-muted-foreground">MEDIUM</div>
              <div className="text-xs text-muted-foreground mt-1">2-4 months stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{data.summary.by_priority.low}</div>
              <div className="text-sm text-muted-foreground">LOW</div>
              <div className="text-xs text-muted-foreground mt-1">4-6 months stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.summary.by_priority.sufficient}</div>
              <div className="text-sm text-muted-foreground">SUFFICIENT</div>
              <div className="text-xs text-muted-foreground mt-1">&gt; 6 months stock</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devils Thumb Production Plan */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Devils Thumb Distillery - Complete Production Plan 2026</CardTitle>
          <CardDescription>
            {devilsThumb.length} products | {devilsThumb.reduce((sum, p) => sum + p.batches_needed_rounded, 0)} batches | {devilsThumb.reduce((sum, p) => sum + p.total_production_units, 0).toLocaleString()} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">2025 Sales</TableHead>
                <TableHead className="text-right">2026 Projected</TableHead>
                <TableHead className="text-right">Stock (Nov 13)</TableHead>
                <TableHead className="text-right">Months Left</TableHead>
                <TableHead className="text-right">Batches</TableHead>
                <TableHead className="text-right">Units to Produce</TableHead>
                <TableHead className="text-right">Quarter</TableHead>
                <TableHead className="text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devilsThumb.map((product) => (
                <TableRow key={product.sku_code}>
                  <TableCell className="font-medium">
                    {product.product_name}
                    <div className="text-xs text-muted-foreground">{product.bottles_per_batch} bottles/batch</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.sales_2025_actual.toLocaleString()}
                    <div className="text-xs text-muted-foreground">{formatCurrency(product.sales_2025_value)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.sales_2026_projected.toLocaleString()}
                    <div className="text-xs text-green-600">+10%</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock_after_dec_sales}
                    <div className="text-xs text-muted-foreground">from {product.current_stock_nov_13}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={product.months_of_stock_current < 2 ? 'text-red-600 font-bold' : product.months_of_stock_current < 4 ? 'text-orange-600' : ''}>
                      {product.months_of_stock_current.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {product.batches_needed_rounded > 0 ? product.batches_needed_rounded : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {product.total_production_units > 0 ? product.total_production_units.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {product.recommended_quarter !== 'NONE' ? product.recommended_quarter : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className={getPriorityColor(product.priority)}>
                      {product.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Merchant Mae Production Plan */}
      <Card>
        <CardHeader>
          <CardTitle>🏴‍☠️ Merchant Mae - Complete Production Plan 2026</CardTitle>
          <CardDescription>
            {merchantMae.length} products | {merchantMae.reduce((sum, p) => sum + p.batches_needed_rounded, 0)} batches | {merchantMae.reduce((sum, p) => sum + p.total_production_units, 0).toLocaleString()} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">2025 Sales</TableHead>
                <TableHead className="text-right">2026 Projected</TableHead>
                <TableHead className="text-right">Stock (Nov 13)</TableHead>
                <TableHead className="text-right">Months Left</TableHead>
                <TableHead className="text-right">Batches</TableHead>
                <TableHead className="text-right">Units to Produce</TableHead>
                <TableHead className="text-right">Quarter</TableHead>
                <TableHead className="text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merchantMae.map((product) => (
                <TableRow key={product.sku_code}>
                  <TableCell className="font-medium">
                    {product.product_name}
                    <div className="text-xs text-muted-foreground">{product.bottles_per_batch} bottles/batch</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.sales_2025_actual.toLocaleString()}
                    <div className="text-xs text-muted-foreground">{formatCurrency(product.sales_2025_value)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.sales_2026_projected.toLocaleString()}
                    <div className="text-xs text-green-600">+10%</div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock_after_dec_sales}
                    <div className="text-xs text-muted-foreground">from {product.current_stock_nov_13}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={product.months_of_stock_current < 2 ? 'text-red-600 font-bold' : product.months_of_stock_current < 4 ? 'text-orange-600' : ''}>
                      {product.months_of_stock_current.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {product.batches_needed_rounded > 0 ? product.batches_needed_rounded : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {product.total_production_units > 0 ? product.total_production_units.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {product.recommended_quarter !== 'NONE' ? product.recommended_quarter : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className={getPriorityColor(product.priority)}>
                      {product.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quarterly Production Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>📅 2026 Quarterly Production Schedule</CardTitle>
          <CardDescription>
            Equipment usage and batch scheduling by quarter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {data.quarterly_schedule.map((quarter) => (
              <div key={quarter.quarter} className={`p-4 rounded-lg border-2 ${
                quarter.total_batches > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-bold text-lg mb-2">{quarter.quarter}</div>
                <div className="text-xs text-muted-foreground mb-3">{quarter.months.join(', ')}</div>

                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Batches</div>
                    <div className="text-2xl font-bold">{quarter.total_batches}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Units</div>
                    <div className="font-bold">{quarter.total_units.toLocaleString()}</div>
                  </div>

                  {quarter.total_batches > 0 && (
                    <>
                      <div className="pt-2 border-t">
                        <div className="text-muted-foreground">Equipment Days</div>
                        <div className="text-xs space-y-1 mt-1">
                          <div>Gin Still: {quarter.equipment_usage.gin_still_days}d</div>
                          <div>Rum Still: {quarter.equipment_usage.rum_still_days}d</div>
                          <div>Fermenters: {quarter.equipment_usage.fermentation_tanks}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-muted-foreground mb-1">Products ({quarter.products.length})</div>
                        <div className="text-xs space-y-1">
                          {quarter.products.slice(0, 3).map((p, i) => (
                            <div key={i}>• {p.product.split(' ')[0]} ({p.batches})</div>
                          ))}
                          {quarter.products.length > 3 && (
                            <div className="text-muted-foreground">+ {quarter.products.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment & Resources Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Equipment & Resources Required (Q1 2026)</CardTitle>
          <CardDescription>
            Based on {data.quarterly_schedule[0].total_batches} batches scheduled for January-March
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Production Equipment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gin Still Days:</span>
                  <span className="font-bold">{data.quarterly_schedule[0].equipment_usage.gin_still_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Rum Still Days:</span>
                  <span className="font-bold">{data.quarterly_schedule[0].equipment_usage.rum_still_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Fermentation Tanks:</span>
                  <span className="font-bold">{data.quarterly_schedule[0].equipment_usage.fermentation_tanks} tanks</span>
                </div>
                <div className="flex justify-between">
                  <span>Bottling Days:</span>
                  <span className="font-bold">~{data.quarterly_schedule[0].total_batches * 3} days</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Production by Type</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gin Batches:</span>
                  <span className="font-bold">{data.summary.by_production_type.gin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rum Batches:</span>
                  <span className="font-bold">{data.summary.by_production_type.rum}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cane Spirit Batches:</span>
                  <span className="font-bold">{data.summary.by_production_type.cane_spirit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vodka Batches:</span>
                  <span className="font-bold">{data.summary.by_production_type.vodka}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">⚠️ Potential Bottlenecks</h4>
              <ul className="space-y-2 text-sm">
                {data.quarterly_schedule[0].equipment_usage.gin_still_days > 30 && (
                  <li className="text-red-600">• Gin still overbooked - consider extended hours</li>
                )}
                {data.quarterly_schedule[0].equipment_usage.rum_still_days > 30 && (
                  <li className="text-red-600">• Rum still overbooked - consider extended hours</li>
                )}
                {data.quarterly_schedule[0].equipment_usage.fermentation_tanks > 4 && (
                  <li className="text-orange-600">• {data.quarterly_schedule[0].equipment_usage.fermentation_tanks} fermenters needed - plan rotation</li>
                )}
                {data.quarterly_schedule[0].total_batches * 3 > 60 && (
                  <li className="text-orange-600">• Bottling line heavily utilized - consider outsourcing</li>
                )}
                {data.quarterly_schedule[0].equipment_usage.gin_still_days <= 30 &&
                 data.quarterly_schedule[0].equipment_usage.rum_still_days <= 30 && (
                  <li className="text-green-600">✓ Equipment capacity looks manageable</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

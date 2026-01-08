import { getCachedCustomerAnalytics } from '@/modules/crm/analytics'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type CustomerDetail = {
  customerId: string
  customerName: string
  totalSpend: number
  totalUnits: number
  averageOrderValue: number
  orderCount: number
  firstOrderDate: string
  lastOrderDate: string
  averageDaysBetweenOrders: number
  daysSinceLastOrder: number
  churnRisk: number
  topProducts: { sku: string; productName: string; units: number }[]
  monthlySpend: { month: string; spend: number }[]
  inactiveProducts: string[]
  alerts?: string[]
}

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const number = new Intl.NumberFormat('en-AU')

function getCustomerSync(id: string): CustomerDetail {
  const list = getCachedCustomerAnalytics() as any[]
  const c = list.find(x => x.customerId === id)
  if (!c) throw new Error('Customer not found')
  return c as unknown as CustomerDetail
}

export default async function CustomerProfilePage(props: PageProps<"/dashboard/crm/[id]">) {
  const { id } = await props.params
  const c = getCustomerSync(id)

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-stone-900">{c.customerName || 'Customer'}</h1>
        <p className="text-stone-500 text-sm">ID: {c.customerId}</p>
        {c.alerts && c.alerts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {c.alerts.map(a => (
              <span key={a} className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-900">{a}</span>
            ))}
          </div>
        )}
      </header>

      {/* Overview */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          <Card title="Total spend" value={currency.format(c.totalSpend)} subtitle="2025" />
          <Card title="Units" value={number.format(c.totalUnits)} subtitle="All SKUs" />
          <Card title="Orders" value={number.format(c.orderCount)} subtitle="Transactions" />
          <Card title="Avg order" value={currency.format(c.averageOrderValue)} subtitle="AOV" />
          <Card title="Last order" value={c.lastOrderDate} subtitle={`${c.daysSinceLastOrder} days ago`} />
          <Card title="Order freq" value={`${c.averageDaysBetweenOrders} d`} subtitle="Avg gap" />
        </div>
      </section>

      {/* Product Mix */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Top Products</h2>
          <p className="text-sm text-stone-500 mt-1">Mix by units</p>
        </div>
        <div className="p-6">
          <ul className="space-y-2">
            {c.topProducts.map(p => (
              <li key={p.sku} className="flex items-center justify-between">
                <span className="text-stone-800">{p.productName}</span>
                <span className="text-stone-600">{number.format(p.units)} units</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Purchase History */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Monthly Spend</h2>
          <p className="text-sm text-stone-500 mt-1">Timeline</p>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-stone-500">
              <tr>
                <th className="pb-3">Month</th>
                <th className="pb-3 text-right">Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {c.monthlySpend.map(m => (
                <tr key={m.month}>
                  <td className="py-3 text-stone-800">{m.month}</td>
                  <td className="py-3 text-right text-stone-700">{currency.format(m.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inactive Products */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Inactive Products</h2>
          <p className="text-sm text-stone-500 mt-1">SKUs previously purchased, now inactive</p>
        </div>
        <div className="p-6">
          {c.inactiveProducts.length === 0 ? (
            <p className="text-stone-600">No inactive products.</p>
          ) : (
            <ul className="list-disc pl-5 text-stone-800">
              {c.inactiveProducts.map(sku => (
                <li key={sku}>{sku}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function Card({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="border rounded-xl shadow-sm p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
      <h3 className="text-sm font-medium text-stone-500">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
    </div>
  )
}

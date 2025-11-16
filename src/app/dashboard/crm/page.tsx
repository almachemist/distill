import { getCachedCustomerGroups } from '@/modules/crm/groups'
import ClientGroups from './ClientGroups'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type TableCustomer = {
  customerId: string
  customerName: string
  totalSpend: number
  totalUnits: number
  lastOrderDate: string
  churnRisk: number
  topProduct: string
  inactiveSince: number
  alerts: string[]
}

const currency = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
const number = new Intl.NumberFormat('en-AU')

function loadGroups() {
  return getCachedCustomerGroups() as any[]
}


export default function CRMDashboardPage() {
  const groups = loadGroups()

  const totalGroups = groups.length
  const active30 = groups.filter((g: any) => g.daysSinceLastOrder <= 30).length
  const atRisk = groups.filter((g: any) => g.churnRisk >= 100).length
  const avgOrderFrequency = Math.round(
    groups.reduce((acc: number, g: any) => acc + (g.daysSinceLastOrder || 0), 0) / Math.max(1, totalGroups)
  )
  const avgCustomerValue = groups.reduce((acc: number, g: any) => acc + g.totalSpend, 0) / Math.max(1, totalGroups)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-stone-900">CRM Analytics</h1>
        <p className="text-stone-600">Client intelligence built from 2025 sales data</p>
      </header>

      {/* High-Level Metrics */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card title="Total customers" value={number.format(totalCustomers)} subtitle="All accounts" />
          <Card title="Active (30d)" value={number.format(active30)} subtitle="Recently ordered" />
          <Card title="At risk" value={number.format(atRisk)} subtitle="Needs attention" />
          <Card title="Avg inactivity (days)" value={number.format(avgOrderFrequency)} subtitle="Across customers" />
          <Card title="Avg customer value" value={currency.format(avgCustomerValue)} subtitle="Annual 2025" />
        </div>
      </section>

      {/* Customer Groups Table */}
      <section className="bg-white border border-stone-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Customer Groups</h2>
          <p className="text-sm text-stone-500 mt-1">Parent accounts with consolidated spend and churn</p>
        </div>
        <div className="p-6">
          <ClientGroups groups={groups as any[]} />
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


import { Suspense } from 'react'
import { OrderStart } from '@/modules/production/components/OrderStart'

export default function OrderStartPage() {
  return (
    <Suspense fallback={<div className="space-y-6" />}> 
      <OrderStart />
    </Suspense>
  )
}

export const metadata = {
  title: 'Start Production - Distil',
  description: 'Start a new production batch'
}



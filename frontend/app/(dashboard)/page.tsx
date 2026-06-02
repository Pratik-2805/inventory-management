'use client'

import { useEffect, useState } from 'react'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { InventoryTrendChart } from '@/components/dashboard/inventory-trend-chart'
import { PurchaseVsSalesChart } from '@/components/dashboard/purchase-vs-sales-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { LowStockAlerts } from '@/components/dashboard/low-stock-alerts'
import { TopSellingProducts } from '@/components/dashboard/top-selling-products'
import { api } from '@/lib/api-client'

interface DashboardData {
  totalProducts: number
  totalSuppliers: number
  currentInventoryValue: number
  lowStockCount: number
  recentMovements: any[]
  recentBills: any[]
}

interface ValuationItem {
  id: string
  sku: string
  name: string
  currentStock: number
  valuation: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [valuationData, setValuationData] = useState<ValuationItem[]>([])

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        const [dashRes, valRes] = await Promise.all([
          api.get<DashboardData>('/dashboard'),
          api.get<ValuationItem[]>('/inventory/valuation'),
        ])

        if (!dashRes.success) {
          throw new Error(dashRes.error || 'Failed to fetch dashboard metrics')
        }
        if (!valRes.success) {
          throw new Error(valRes.error || 'Failed to fetch inventory valuation')
        }

        setDashboardData(dashRes.data || null)
        setValuationData(valRes.data || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'An error occurred while loading dashboard metrics')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading ERP dashboard data...</p>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="p-8 space-y-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-6 text-red-800 dark:text-red-200">
          <h2 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h2>
          <p className="text-sm mb-4">{error || 'Unable to communicate with the backend API.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Calculate total purchases from all loaded transactions (or fallback to recent invoice totals)
  const totalPurchases = dashboardData.recentBills.reduce((sum, b) => sum + b.grandTotal, 0)
  // Approximate pending returns count (e.g. from total movements or mock return page items count)
  const pendingReturns = dashboardData.recentMovements.filter((m) => m.movementType === 'PURCHASE_RETURN').length

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your inventory management system</p>
      </div>

      <KPICards 
        totalProducts={dashboardData.totalProducts}
        inventoryValue={dashboardData.currentInventoryValue}
        totalSuppliers={dashboardData.totalSuppliers}
        lowStockCount={dashboardData.lowStockCount}
        totalPurchases={totalPurchases}
        pendingReturns={pendingReturns}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryTrendChart />
        <PurchaseVsSalesChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts items={valuationData} />
        <TopSellingProducts items={valuationData} />
      </div>

      <RecentActivities movements={dashboardData.recentMovements} />
    </div>
  )
}


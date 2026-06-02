import { Card, CardContent, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Package, ShoppingCart, RotateCcw, AlertTriangle, Users } from 'lucide-react'

interface KPICardsProps {
  totalProducts: number
  inventoryValue: number
  totalSuppliers: number
  lowStockCount: number
  totalPurchases: number
  pendingReturns: number
}

export function KPICards({
  totalProducts,
  inventoryValue,
  totalSuppliers,
  lowStockCount,
  totalPurchases,
  pendingReturns,
}: KPICardsProps) {
  const kpiData = [
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      change: 'Live',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Inventory Value',
      value: `₹${inventoryValue.toLocaleString('en-IN')}`,
      change: 'Realtime',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Total Suppliers',
      value: totalSuppliers.toLocaleString(),
      change: 'Active',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Total Purchases',
      value: `₹${totalPurchases.toLocaleString('en-IN')}`,
      change: 'Invoice Total',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-emerald-100 dark:bg-emerald-900',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Pending Returns',
      value: pendingReturns.toString(),
      change: 'Purchase Returns',
      trend: 'down',
      icon: RotateCcw,
      color: 'bg-orange-100 dark:bg-orange-900',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      change: 'Threshold: 5',
      trend: 'down',
      icon: AlertTriangle,
      color: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiData.map((kpi, idx) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          {(() => {
            const Icon = kpi.icon
            const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown

            return (
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                  <div className={`${kpi.color} p-2 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${kpi.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`w-4 h-4 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}
        </motion.div>
      ))}
    </div>
  )
}


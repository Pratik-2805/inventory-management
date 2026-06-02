import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import {
  Package,
  ShoppingCart,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'

interface Movement {
  id: string
  movementType: string
  quantity: number
  referenceType: string
  referenceId: string
  remarks?: string
  createdAt: string
  product?: {
    name: string
    sku: string
  }
}

interface RecentActivitiesProps {
  movements: Movement[]
}

const typeConfig: Record<string, { icon: any; color: string; title: string }> = {
  PURCHASE: {
    icon: ShoppingCart,
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    title: 'Stock Purchased',
  },
  PURCHASE_RETURN: {
    icon: RotateCcw,
    color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    title: 'Purchase Return',
  },
  SALE: {
    icon: TrendingUp,
    color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    title: 'Stock Sold',
  },
  ADJUSTMENT: {
    icon: Package,
    color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    title: 'Stock Adjusted',
  },
  DAMAGE: {
    icon: AlertTriangle,
    color: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    title: 'Damaged Stock',
  },
}

export function RecentActivities({ movements }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest transactions and events in your system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity found.</p>
          ) : (
            movements.map((activity) => {
              const config = typeConfig[activity.movementType] || {
                icon: HelpCircle,
                color: 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400',
                title: activity.movementType,
              }
              const Icon = config.icon

              return (
                <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className={`${config.color} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{config.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.remarks || `Stock movement for product ${activity.product?.name || 'Unknown'}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {activity.quantity > 0 ? '+' : ''}{activity.quantity} units | SKU: {activity.product?.sku || 'N/A'} | {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}


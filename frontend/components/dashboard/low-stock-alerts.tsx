import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Badge } from '@/components/custom-ui/badge'

interface ValuationItem {
  id: string
  sku: string
  name: string
  currentStock: number
  valuation: number
}

interface LowStockAlertsProps {
  items: ValuationItem[]
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  const lowStockItems = items.filter((item) => item.currentStock <= 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alerts</CardTitle>
        <CardDescription>{lowStockItems.length} products at or below threshold level (5 units)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All products are well stocked!</p>
          ) : (
            lowStockItems.map((item) => (
              <div key={item.sku} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.currentStock === 0 ? 'destructive' : 'secondary'}>
                      {item.currentStock} units
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Threshold: 5</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}


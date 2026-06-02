import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Badge } from '@/components/custom-ui/badge'

interface ValuationItem {
  id: string
  sku: string
  name: string
  currentStock: number
  valuation: number
}

interface TopSellingProductsProps {
  items: ValuationItem[]
}

export function TopSellingProducts({ items }: TopSellingProductsProps) {
  // Sort by stock units descending to show products with highest inventory volume
  const topProducts = [...items]
    .sort((a, b) => b.currentStock - a.currentStock)
    .slice(0, 5)

  const maxStock = Math.max(...topProducts.map((p) => p.currentStock), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Stocked Products</CardTitle>
        <CardDescription>Products with highest volume in warehouse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No products in inventory.</p>
          ) : (
            topProducts.map((product) => (
              <div key={product.sku} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.currentStock} units in stock</p>
                  </div>
                  <Badge variant="outline">₹{product.valuation.toLocaleString('en-IN')}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(product.currentStock / maxStock) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}


'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Download, Filter } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const movementData = [
  { month: 'Jan', inbound: 2500, outbound: 1800, transfers: 400, adjustments: 50 },
  { month: 'Feb', inbound: 3200, outbound: 2100, transfers: 350, adjustments: 75 },
  { month: 'Mar', inbound: 2800, outbound: 1950, transfers: 420, adjustments: 60 },
  { month: 'Apr', inbound: 3800, outbound: 2450, transfers: 380, adjustments: 85 },
  { month: 'May', inbound: 3300, outbound: 2200, transfers: 410, adjustments: 70 },
  { month: 'Jun', inbound: 4100, outbound: 2700, transfers: 450, adjustments: 90 },
  { month: 'Jul', inbound: 4400, outbound: 2950, transfers: 470, adjustments: 100 },
  { month: 'Aug', inbound: 4200, outbound: 2850, transfers: 460, adjustments: 95 },
]

const movementTypeData = [
  { type: 'Purchase', units: 26400 },
  { type: 'Sale', units: 18650 },
  { type: 'Transfer', units: 3345 },
  { type: 'Adjustment', units: 675 },
  { type: 'Return', units: 1250 },
]

export default function StockMovementReportPage() {
  const totalMovement = movementData.reduce((sum, d) => sum + d.inbound + d.outbound, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Stock Movement Report</h1>
          <p className="text-muted-foreground">Detailed analysis of inventory movements and trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inbound</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26,400</div>
            <p className="text-xs text-muted-foreground mt-1">Units received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Outbound</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,650</div>
            <p className="text-xs text-muted-foreground mt-1">Units shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,345</div>
            <p className="text-xs text-muted-foreground mt-1">Inter-warehouse</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">675</div>
            <p className="text-xs text-muted-foreground mt-1">Variance corrections</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Movement Trend</CardTitle>
            <CardDescription>Inbound vs Outbound units</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" fill="#10b981" name="Inbound" />
                <Bar dataKey="outbound" fill="#ef4444" name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement by Type</CardTitle>
            <CardDescription>Distribution of stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movementTypeData.map((item) => {
                const percentage = (item.units / (movementTypeData.reduce((sum, i) => sum + i.units, 0))) * 100

                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.units.toLocaleString()} units</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

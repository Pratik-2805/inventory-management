'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Download, Filter } from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const profitData = [
  { month: 'Jan', revenue: 45000, cogs: 27000, profit: 18000 },
  { month: 'Feb', revenue: 52000, cogs: 31200, profit: 20800 },
  { month: 'Mar', revenue: 48000, cogs: 28800, profit: 19200 },
  { month: 'Apr', revenue: 65000, cogs: 39000, profit: 26000 },
  { month: 'May', revenue: 58000, cogs: 34800, profit: 23200 },
  { month: 'Jun', revenue: 72000, cogs: 43200, profit: 28800 },
  { month: 'Jul', revenue: 78000, cogs: 46800, profit: 31200 },
  { month: 'Aug', revenue: 75000, cogs: 45000, profit: 30000 },
]

export default function ProfitReportPage() {
  const totalRevenue = profitData.reduce((sum, d) => sum + d.revenue, 0)
  const totalCOGS = profitData.reduce((sum, d) => sum + d.cogs, 0)
  const totalProfit = profitData.reduce((sum, d) => sum + d.profit, 0)
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Profit Report</h1>
          <p className="text-muted-foreground">Financial performance and profitability analysis</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">8-month total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total COGS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalCOGS.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost of goods sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground mt-1">Net margin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Cost Trend</CardTitle>
          <CardDescription>Monthly revenue and cost analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" fill="#10b981" stroke="#059669" name="Revenue" />
              <Area type="monotone" dataKey="cogs" fill="#ef4444" stroke="#dc2626" name="COGS" />
              <Area type="monotone" dataKey="profit" fill="#3b82f6" stroke="#1d4ed8" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed profit analysis by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profitData.map((month) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{month.month}</span>
                  <span className="text-green-600">${month.profit.toLocaleString()}</span>
                </div>
                <div className="flex gap-1 h-6 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="bg-orange-500"
                    style={{ width: `${(month.cogs / month.revenue) * 100}%` }}
                    title="COGS"
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(month.profit / month.revenue) * 100}%` }}
                    title="Profit"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

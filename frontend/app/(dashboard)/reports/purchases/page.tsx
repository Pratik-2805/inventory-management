'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Download, Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const monthlyPurchaseData = [
  { month: 'Jan', purchases: 35000, orders: 12 },
  { month: 'Feb', purchases: 42000, orders: 15 },
  { month: 'Mar', purchases: 38000, orders: 11 },
  { month: 'Apr', purchases: 50000, orders: 18 },
  { month: 'May', purchases: 45000, orders: 14 },
  { month: 'Jun', purchases: 55000, orders: 20 },
  { month: 'Jul', purchases: 60000, orders: 22 },
  { month: 'Aug', purchases: 58000, orders: 19 },
]

const topSuppliers = [
  { supplier: 'Supplier ABC', purchases: 245000, orders: 12 },
  { supplier: 'Supplier DEF', purchases: 185000, orders: 15 },
  { supplier: 'Supplier XYZ', purchases: 165000, orders: 8 },
  { supplier: 'Supplier GHI', purchases: 95000, orders: 5 },
]

export default function PurchaseReportPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Report</h1>
          <p className="text-muted-foreground">Analysis of purchase orders and supplier performance</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$383,000</div>
            <p className="text-xs text-muted-foreground mt-1">YTD spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,192</div>
            <p className="text-xs text-muted-foreground mt-1">Per PO</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground mt-1">Purchase orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Active suppliers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Purchase Trend</CardTitle>
            <CardDescription>Purchase volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPurchaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="purchases" fill="#8b5cf6" name="Amount ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers</CardTitle>
            <CardDescription>By total purchase amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSuppliers.map((supplier) => (
                <div key={supplier.supplier} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{supplier.supplier}</span>
                    <span className="text-muted-foreground">${(supplier.purchases / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(supplier.purchases / 245000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

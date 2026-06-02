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

const monthlySalesData = [
  { month: 'Jan', sales: 45000, transactions: 45 },
  { month: 'Feb', sales: 52000, transactions: 52 },
  { month: 'Mar', sales: 48000, transactions: 48 },
  { month: 'Apr', sales: 65000, transactions: 65 },
  { month: 'May', sales: 58000, transactions: 58 },
  { month: 'Jun', sales: 72000, transactions: 72 },
  { month: 'Jul', sales: 78000, transactions: 78 },
  { month: 'Aug', sales: 75000, transactions: 75 },
]

const topCustomers = [
  { customer: 'Customer A', sales: 125000, percentage: 22 },
  { customer: 'Customer B', sales: 95000, percentage: 17 },
  { customer: 'Customer C', sales: 85000, percentage: 15 },
  { customer: 'Customer D', sales: 72000, percentage: 13 },
  { customer: 'Customer E', sales: 58000, percentage: 10 },
]

export default function SalesReportPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground">Revenue analysis and sales performance</p>
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
            <div className="text-2xl font-bold">$573,000</div>
            <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">493</div>
            <p className="text-xs text-muted-foreground mt-1">Average invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,162</div>
            <p className="text-xs text-muted-foreground mt-1">Per invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+18%</div>
            <p className="text-xs text-muted-foreground mt-1">Month-on-month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
            <CardDescription>Revenue over the past 8 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>By revenue contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer) => (
                <div key={customer.customer} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{customer.customer}</span>
                    <span className="text-muted-foreground">{customer.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${customer.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">${customer.sales.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

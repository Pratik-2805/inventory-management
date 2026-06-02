'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', purchases: 35000, sales: 45000 },
  { month: 'Feb', purchases: 42000, sales: 52000 },
  { month: 'Mar', purchases: 38000, sales: 48000 },
  { month: 'Apr', purchases: 50000, sales: 65000 },
  { month: 'May', purchases: 45000, sales: 58000 },
  { month: 'Jun', purchases: 55000, sales: 72000 },
  { month: 'Jul', purchases: 60000, sales: 78000 },
  { month: 'Aug', purchases: 58000, sales: 75000 },
]

export function PurchaseVsSalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchases vs Sales</CardTitle>
        <CardDescription>Monthly comparison of purchases and sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="purchases" fill="#8b5cf6" name="Purchases" />
            <Bar dataKey="sales" fill="#10b981" name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', value: 45000, capacity: 60000 },
  { month: 'Feb', value: 52000, capacity: 60000 },
  { month: 'Mar', value: 48000, capacity: 60000 },
  { month: 'Apr', value: 61000, capacity: 60000 },
  { month: 'May', value: 55000, capacity: 60000 },
  { month: 'Jun', value: 67000, capacity: 75000 },
  { month: 'Jul', value: 72000, capacity: 75000 },
  { month: 'Aug', value: 68000, capacity: 75000 },
]

export function InventoryTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Trend</CardTitle>
        <CardDescription>Monthly inventory value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Inventory Value" />
            <Line
              type="monotone"
              dataKey="capacity"
              stroke="#e5e7eb"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Capacity"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

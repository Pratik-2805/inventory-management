'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/custom-ui/table'
import { Plus } from 'lucide-react'

const adjustments = [
  {
    id: 1,
    adjustmentNo: 'ADJ-2024-001',
    sku: 'SKU-001',
    product: 'Cotton T-Shirt',
    warehouse: 'Main Warehouse',
    reason: 'Inventory count variance',
    previousQty: 250,
    adjustedQty: -10,
    newQty: 240,
    date: '2024-01-18',
  },
  {
    id: 2,
    adjustmentNo: 'ADJ-2024-002',
    sku: 'SKU-004',
    product: 'LED Desk Lamp',
    warehouse: 'Branch',
    reason: 'Damaged units removed',
    previousQty: 175,
    adjustedQty: -5,
    newQty: 170,
    date: '2024-01-19',
  },
  {
    id: 3,
    adjustmentNo: 'ADJ-2024-003',
    sku: 'SKU-005',
    product: 'Office Chair',
    warehouse: 'Main Warehouse',
    reason: 'Stock correction',
    previousQty: 32,
    adjustedQty: +8,
    newQty: 40,
    date: '2024-01-20',
  },
]

export default function StockAdjustmentsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
          <p className="text-muted-foreground">Record and track inventory adjustments</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Adjustment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Records</CardTitle>
          <CardDescription>All stock adjustments ({adjustments.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Adjustment No.</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Previous Qty</TableHead>
                  <TableHead className="text-right">Adjusted</TableHead>
                  <TableHead className="text-right">New Qty</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adj) => (
                  <TableRow key={adj.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-semibold">{adj.adjustmentNo}</TableCell>
                    <TableCell className="font-mono text-sm">{adj.sku}</TableCell>
                    <TableCell>{adj.product}</TableCell>
                    <TableCell>{adj.warehouse}</TableCell>
                    <TableCell className="text-right">{adj.previousQty}</TableCell>
                    <TableCell className="text-right">
                      <span className={adj.adjustedQty < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {adj.adjustedQty > 0 ? '+' : ''}{adj.adjustedQty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{adj.newQty}</TableCell>
                    <TableCell>{adj.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

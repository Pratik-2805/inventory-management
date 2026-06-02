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
import { Badge } from '@/components/custom-ui/badge'
import { Plus } from 'lucide-react'

const transfers = [
  {
    id: 1,
    transferNo: 'STR-2024-001',
    fromWarehouse: 'Main Warehouse',
    toWarehouse: 'Branch',
    date: '2024-01-18',
    items: 5,
    quantity: 150,
    status: 'Completed',
  },
  {
    id: 2,
    transferNo: 'STR-2024-002',
    fromWarehouse: 'Main Warehouse',
    toWarehouse: 'Distribution Center',
    date: '2024-01-19',
    items: 3,
    quantity: 75,
    status: 'In Transit',
  },
  {
    id: 3,
    transferNo: 'STR-2024-003',
    fromWarehouse: 'Branch',
    toWarehouse: 'Main Warehouse',
    date: '2024-01-20',
    items: 2,
    quantity: 40,
    status: 'Pending',
  },
]

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'In Transit': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export default function StockTransfersPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Stock Transfers</h1>
          <p className="text-muted-foreground">Manage stock movements between warehouses</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>All stock transfer records ({transfers.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Transfer No.</TableHead>
                  <TableHead>From Warehouse</TableHead>
                  <TableHead>To Warehouse</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-semibold">{transfer.transferNo}</TableCell>
                    <TableCell>{transfer.fromWarehouse}</TableCell>
                    <TableCell>{transfer.toWarehouse}</TableCell>
                    <TableCell>{transfer.date}</TableCell>
                    <TableCell className="text-right font-semibold">{transfer.quantity}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[transfer.status]} variant="outline">
                        {transfer.status}
                      </Badge>
                    </TableCell>
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

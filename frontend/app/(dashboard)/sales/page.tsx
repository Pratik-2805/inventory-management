'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Input } from '@/components/custom-ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/custom-ui/table'
import { Badge } from '@/components/custom-ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/custom-ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectNative,
} from '@/components/custom-ui/select'
import { Plus, Search } from 'lucide-react'
const salesInvoices = [
  {
    id: 1,
    invoiceNo: 'INV-2024-001',
    customer: 'Customer A',
    date: '2024-01-10',
    items: 5,
    subtotal: 25000,
    tax: 4500,
    total: 29500,
    status: 'Paid',
  },
  {
    id: 2,
    invoiceNo: 'INV-2024-002',
    customer: 'Customer B',
    date: '2024-01-12',
    items: 3,
    subtotal: 18000,
    tax: 3240,
    total: 21240,
    status: 'Paid',
  },
  {
    id: 3,
    invoiceNo: 'INV-2024-003',
    customer: 'Customer C',
    date: '2024-01-15',
    items: 8,
    subtotal: 45000,
    tax: 8100,
    total: 53100,
    status: 'Partially Paid',
  },
  {
    id: 4,
    invoiceNo: 'INV-2024-004',
    customer: 'Customer D',
    date: '2024-01-18',
    items: 4,
    subtotal: 32000,
    tax: 5760,
    total: 37760,
    status: 'Unpaid',
  },
  {
    id: 5,
    invoiceNo: 'INV-2024-005',
    customer: 'Customer E',
    date: '2024-01-20',
    items: 6,
    subtotal: 28000,
    tax: 5040,
    total: 33040,
    status: 'Overdue',
  },
]
const statusColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Partially Paid': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Unpaid': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}


export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statuses = Array.from(new Set(salesInvoices.map((inv) => inv.status)))

  const filteredInvoices = salesInvoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalItems = filteredInvoices.reduce((sum, inv) => sum + inv.items, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
        <p className="text-muted-foreground">Manage your sales invoices and customer transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">across all invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(totalRevenue / filteredInvoices.length).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">per invoice</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Invoices</CardTitle>
              <CardDescription>List of all sales invoices ({filteredInvoices.length})</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Sales Invoice</DialogTitle>
                  <DialogDescription>Enter details for the new sales invoice</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="customer" className="block text-sm font-medium mb-2">Customer</label>
<SelectNative />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="invoice-no" className="block text-sm font-medium mb-2">Invoice Number</label>
                      <Input id="invoice-no" placeholder="INV-2024-XXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="invoice-date" className="block text-sm font-medium mb-2">Invoice Date</label>
                    <Input id="invoice-date" type="date" />
                  </div>
                  <Button className="w-full">Create Invoice</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-semibold">{invoice.invoiceNo}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="text-right">{invoice.items}</TableCell>
                    <TableCell className="text-right font-semibold">${invoice.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]} variant="outline">
                        {invoice.status}
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


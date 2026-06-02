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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectNative,
} from '@/components/custom-ui/select'
import { Search, Download, Send } from 'lucide-react'

const invoices = [
  {
    id: 1,
    invoiceNo: 'INV-2024-001',
    customer: 'Customer A',
    date: '2024-01-10',
    dueDate: '2024-02-10',
    amount: 29500,
    paid: 29500,
    pending: 0,
    paymentStatus: 'Paid',
  },
  {
    id: 2,
    invoiceNo: 'INV-2024-002',
    customer: 'Customer B',
    date: '2024-01-12',
    dueDate: '2024-02-12',
    amount: 21240,
    paid: 21240,
    pending: 0,
    paymentStatus: 'Paid',
  },
  {
    id: 3,
    invoiceNo: 'INV-2024-003',
    customer: 'Customer C',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 53100,
    paid: 26550,
    pending: 26550,
    paymentStatus: 'Partially Paid',
  },
  {
    id: 4,
    invoiceNo: 'INV-2024-004',
    customer: 'Customer D',
    date: '2024-01-18',
    dueDate: '2024-02-18',
    amount: 37760,
    paid: 0,
    pending: 37760,
    paymentStatus: 'Unpaid',
  },
  {
    id: 5,
    invoiceNo: 'INV-2024-005',
    customer: 'Customer E',
    date: '2024-01-05',
    dueDate: '2024-02-05',
    amount: 33040,
    paid: 0,
    pending: 33040,
    paymentStatus: 'Overdue',
  },
]

const statusColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Partially Paid': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Unpaid': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const statuses = Array.from(new Set(invoices.map((inv) => inv.paymentStatus)))

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || invoice.paymentStatus === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.paid, 0)
  const totalPending = filteredInvoices.reduce((sum, inv) => sum + inv.pending, 0)
  const paymentPercentage = (totalPaid / totalAmount) * 100

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
        <p className="text-muted-foreground">Track and manage your invoices and payments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{paymentPercentage.toFixed(0)}% collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{((totalPending / totalAmount) * 100).toFixed(0)}% outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min(paymentPercentage, 100)}%`}}/></div>
              <p className="text-sm font-semibold text-center">{paymentPercentage.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>All invoices and payment status ({filteredInvoices.length})</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Payment Status" />
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
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const paidPercentage = (invoice.paid / invoice.amount) * 100

                  return (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm font-semibold">{invoice.invoiceNo}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">${invoice.paid.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-orange-600 font-semibold">${invoice.pending.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.paymentStatus]} variant="outline">
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Send">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

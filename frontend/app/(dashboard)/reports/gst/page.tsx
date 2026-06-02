'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Download, Filter } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/custom-ui/table'

const gstData = [
  {
    month: 'January 2024',
    inwardSupplies: 35000,
    igst: 5250,
    cgst: 2625,
    sgst: 2625,
    outwardSupplies: 45000,
    igstOut: 0,
    cgstOut: 5400,
    sgstOut: 5400,
    totalInput: 10500,
    totalOutput: 10800,
    balance: 300,
  },
  {
    month: 'February 2024',
    inwardSupplies: 42000,
    igst: 6300,
    cgst: 3150,
    sgst: 3150,
    outwardSupplies: 52000,
    igstOut: 0,
    cgstOut: 6240,
    sgstOut: 6240,
    totalInput: 12600,
    totalOutput: 12480,
    balance: -120,
  },
  {
    month: 'March 2024',
    inwardSupplies: 38000,
    igst: 5700,
    cgst: 2850,
    sgst: 2850,
    outwardSupplies: 48000,
    igstOut: 0,
    cgstOut: 5760,
    sgstOut: 5760,
    totalInput: 11400,
    totalOutput: 11520,
    balance: 120,
  },
]

export default function GSTReportPage() {
  const totalInput = gstData.reduce((sum, d) => sum + d.totalInput, 0)
  const totalOutput = gstData.reduce((sum, d) => sum + d.totalOutput, 0)
  const totalGSTPayable = totalOutput - totalInput

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">GST Report</h1>
          <p className="text-muted-foreground">GST/VAT compliance and tax liability analysis</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Input GST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInput.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">ITC available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Output GST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutput.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Liability collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GST Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGSTPayable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(totalGSTPayable).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGSTPayable >= 0 ? 'To be paid' : 'Refund due'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly GST Summary</CardTitle>
          <CardDescription>Quarterly GST liability and input tax credit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Inward Supplies</TableHead>
                  <TableHead className="text-right">Input GST</TableHead>
                  <TableHead className="text-right">Outward Supplies</TableHead>
                  <TableHead className="text-right">Output GST</TableHead>
                  <TableHead className="text-right">GST Payable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gstData.map((row) => {
                  const payable = row.totalOutput - row.totalInput

                  return (
                    <TableRow key={row.month} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-right">${row.inwardSupplies.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">${row.totalInput.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${row.outwardSupplies.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">${row.totalOutput.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-semibold ${payable >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${payable.toLocaleString()}
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

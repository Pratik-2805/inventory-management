'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
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
import { SelectNative } from '@/components/custom-ui/select'
import { Search } from 'lucide-react'
import { api } from '@/lib/api-client'

interface Product {
  id: string
  name: string
  sku: string
}

interface StockMovement {
  id: string
  productId: string
  movementType: string
  quantity: number
  referenceType: string
  referenceId: string
  remarks?: string | null
  createdAt: string
  product?: Product
}

const movementTypes = [
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'PURCHASE_RETURN', label: 'Purchase Return' },
  { value: 'SALE', label: 'Sale' },
  { value: 'CUSTOMER_RETURN', label: 'Customer Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
]

const movementTypeColors: Record<string, string> = {
  'PURCHASE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'PURCHASE_RETURN': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'SALE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'CUSTOMER_RETURN': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'ADJUSTMENT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'DAMAGE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function StockLedgerPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Lists
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  // Filter states
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchFiltersAndLedger = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch products directory first
      const prodRes = await api.get<any>('/products', { limit: 100 })
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data)
      }

      // Fetch ledger movements with current filters
      const params: Record<string, string | undefined> = {
        productId: selectedProduct === 'all' ? undefined : selectedProduct,
        movementType: selectedType === 'all' ? undefined : selectedType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }

      const ledgerRes = await api.get<StockMovement[]>('/ledger/movements', params)
      if (!ledgerRes.success) {
        throw new Error(ledgerRes.error || 'Failed to fetch ledger logs')
      }

      setMovements(ledgerRes.data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while loading ledger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiltersAndLedger()
  }, [selectedProduct, selectedType, startDate, endDate])

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Ledger</h1>
        <p className="text-muted-foreground">Complete record of all stock movements and transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Movement Ledger</CardTitle>
          <CardDescription>All stock in and out transactions ({movements.length})</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-accent/20 rounded-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter by Product</label>
              <SelectNative value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="all">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Movement Type</label>
              <SelectNative value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">All Types</option>
                {movementTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Filtering stock ledger...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Movement Type</TableHead>
                    <TableHead className="text-right">Quantity Change</TableHead>
                    <TableHead>Reference Type</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-sm">
                        No ledger logs match current criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-sm">{new Date(item.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{item.product?.name || 'Unknown product'}</TableCell>
                        <TableCell className="font-mono text-sm font-semibold">{item.product?.sku || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={movementTypeColors[item.movementType] || 'bg-gray-100'} variant="outline">
                            {item.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={item.quantity < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {item.quantity > 0 ? '+' : ''}{item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.referenceType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{item.remarks}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



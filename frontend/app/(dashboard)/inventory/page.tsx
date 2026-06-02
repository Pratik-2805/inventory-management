'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Input } from '@/components/custom-ui/input'
import { SelectNative } from '@/components/custom-ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/custom-ui/table'
import { Badge } from '@/components/custom-ui/badge'
import { BarChart3, Boxes, Package, TrendingDown } from 'lucide-react'
import { Search } from 'lucide-react'
import { api } from '@/lib/api-client'

interface ValuationItem {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  currentStock: number
  latestRate: number
  valuation: number
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inventoryData, setInventoryData] = useState<ValuationItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true)
        const res = await api.get<ValuationItem[]>('/inventory/valuation')
        if (!res.success) {
          throw new Error(res.error || 'Failed to fetch inventory valuation')
        }
        setInventoryData(res.data || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'An error occurred while loading inventory data')
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])

  const categories = Array.from(new Set(inventoryData.map((item) => item.category)))

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Compute metrics
  const totalStockUnits = inventoryData.reduce((sum, item) => sum + item.currentStock, 0)
  const totalValue = inventoryData.reduce((sum, item) => sum + item.valuation, 0)
  const lowStockCount = inventoryData.filter((item) => item.currentStock > 0 && item.currentStock <= 5).length
  const outOfStockCount = inventoryData.filter((item) => item.currentStock === 0).length

  const overviewCards = [
    {
      title: 'Total Stock Units',
      value: totalStockUnits.toLocaleString(),
      icon: Boxes,
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600',
    },
    {
      title: 'Inventory Value',
      value: `₹${totalValue.toLocaleString('en-IN')}`,
      icon: BarChart3,
      color: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600',
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      icon: TrendingDown,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount.toString(),
      icon: Package,
      color: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600',
    },
  ]

  if (loading) {
    return (
      <div className="p-8 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading inventory data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-6 text-red-800 dark:text-red-200">
          <h2 className="text-lg font-semibold mb-2">Error Loading Inventory</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Overview</h1>
        <p className="text-muted-foreground">Monitor your inventory levels and warehouse stock</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${card.textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Details</CardTitle>
          <CardDescription>Stock levels by product and valuation</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <SelectNative
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-[200px]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </SelectNative>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Latest Purchase Rate</TableHead>
                  <TableHead className="text-right">Valuation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-sm">
                      No matching inventory items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => {
                    const isLowStock = item.currentStock > 0 && item.currentStock <= 5
                    const isOutOfStock = item.currentStock === 0

                    return (
                      <TableRow 
                        key={item.id} 
                        className={`hover:bg-muted/50 ${
                          isOutOfStock 
                            ? 'bg-red-50/50 dark:bg-red-950/20' 
                            : isLowStock 
                              ? 'bg-yellow-50/50 dark:bg-yellow-950/20' 
                              : ''
                        }`}
                      >
                        <TableCell className="font-mono text-sm font-semibold">{item.sku}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold">{item.currentStock}</span>
                            {isOutOfStock && <Badge variant="destructive">Out</Badge>}
                            {isLowStock && <Badge variant="secondary">Low</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">₹{item.latestRate.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold">₹{item.valuation.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {inventoryData.length} items
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


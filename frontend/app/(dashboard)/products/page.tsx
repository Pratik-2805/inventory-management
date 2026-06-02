'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/custom-ui/dialog'
import { Download, Upload, Search, Edit2, Trash2, Plus, ArrowLeft, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api-client'

interface Product {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  hsnCode: string
  gstRate: number
  createdAt: string
  updatedAt: string
}

interface ValuationItem {
  id: string
  currentStock: number
}

export default function ProductsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [stockMap, setStockMap] = useState<Record<string, number>>({})
  
  // Pagination and Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // CRUD dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    brand: '',
    category: '',
    hsnCode: '',
    gstRate: 18,
  })
  const [formError, setFormError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [prodRes, valRes] = await Promise.all([
        api.get<Product[]>('/products', {
          searchQuery: searchTerm,
          page: currentPage,
          limit: 10,
        }),
        api.get<ValuationItem[]>('/inventory/valuation')
      ])

      if (!prodRes.success) {
        throw new Error(prodRes.error || 'Failed to fetch products')
      }

      setProducts(prodRes.data || [])
      setTotalPages(prodRes.pagination?.totalPages || 1)
      setTotalCount(prodRes.pagination?.total || 0)

      if (valRes.success && valRes.data) {
        const mapping: Record<string, number> = {}
        valRes.data.forEach((item) => {
          mapping[item.id] = item.currentStock
        })
        setStockMap(mapping)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while fetching products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm])

  const handleOpenCreate = () => {
    setDialogMode('create')
    setEditingProduct(null)
    setFormData({
      sku: '',
      name: '',
      brand: '',
      category: '',
      hsnCode: '',
      gstRate: 18,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setDialogMode('edit')
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      hsnCode: product.hsnCode,
      gstRate: product.gstRate,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const res = await api.delete(`/products/${id}`)
      if (!res.success) {
        alert(res.error || 'Failed to delete product')
      } else {
        fetchProducts()
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'An error occurred during deletion')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!formData.sku || !formData.name || !formData.brand || !formData.category || !formData.hsnCode) {
      setFormError('All fields are required')
      return
    }

    try {
      let res
      if (dialogMode === 'create') {
        res = await api.post('/products', formData)
      } else {
        res = await api.put(`/products/${editingProduct?.id}`, formData)
      }

      if (!res.success) {
        setFormError(res.error || 'Failed to save product details')
      } else {
        setIsDialogOpen(false)
        fetchProducts()
      }
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'An error occurred while saving product')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground">Manage your product inventory and details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>List of all products in your database ({totalCount})</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleOpenCreate} size="sm" className="gap-2 w-full md:w-auto">
                <Plus className="w-4 h-4" />
                New Product
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, brand, category, or name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead>GST Rate</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground text-sm">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const stock = stockMap[product.id] ?? 0
                      const status = stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'
                      const statusColor = 
                        stock === 0 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                          : stock <= 5 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'

                      return (
                        <TableRow key={product.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm font-semibold">{product.sku}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.hsnCode}</TableCell>
                          <TableCell>{product.gstRate}%</TableCell>
                          <TableCell className="text-right font-semibold">{stock}</TableCell>
                          <TableCell>
                            <Badge className={statusColor} variant="outline">
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                onClick={() => handleOpenEdit(product)} 
                                variant="ghost" 
                                size="sm" 
                                className="w-8 h-8 p-0"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(product.id)} 
                                variant="ghost" 
                                size="sm" 
                                className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'create' 
                  ? 'Enter details to create a new product entry.' 
                  : 'Modify product parameters.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md text-red-700 dark:text-red-300 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="sku" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SKU / Catalog Code</label>
                  <Input 
                    id="sku" 
                    value={formData.sku} 
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                    placeholder="e.g. SKU-COTTON-001" 
                    disabled={dialogMode === 'edit'}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Premium Cotton Shirt" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="brand" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand</label>
                  <Input 
                    id="brand" 
                    value={formData.brand} 
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })} 
                    placeholder="e.g. BrandName" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                  <Input 
                    id="category" 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    placeholder="e.g. Apparel" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="hsnCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">HSN Code</label>
                  <Input 
                    id="hsnCode" 
                    value={formData.hsnCode} 
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })} 
                    placeholder="e.g. 6203.42" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gstRate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GST Rate (%)</label>
                  <SelectNative
                    id="gstRate"
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Standard Lower)</option>
                    <option value={12}>12% (Standard Medium)</option>
                    <option value={18}>18% (Standard High)</option>
                    <option value={28}>28% (Luxury / Sin)</option>
                  </SelectNative>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {dialogMode === 'create' ? 'Create Product' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


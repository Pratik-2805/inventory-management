'use client'

import { useEffect, useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/custom-ui/dialog'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { api } from '@/lib/api-client'

interface Supplier {
  id: string
  name: string
  code: string
  gstin: string
  phone: string
  email: string
  address: string
  createdAt: string
  updatedAt: string
}

interface PurchaseBill {
  id: string
  supplierId: string
  grandTotal: number
}

export default function SuppliersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  
  // Aggregate states
  const [purchaseOrdersMap, setPurchaseOrdersMap] = useState<Record<string, { count: number; total: number }>>({})
  
  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('')
  
  // CRUD dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    gstin: '',
    phone: '',
    email: '',
    address: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [supRes, purRes] = await Promise.all([
        api.get<Supplier[]>('/suppliers', { searchQuery: searchTerm }),
        api.get<PurchaseBill[]>('/purchases')
      ])

      if (!supRes.success) {
        throw new Error(supRes.error || 'Failed to fetch suppliers')
      }

      setSuppliers(supRes.data || [])

      if (purRes.success && purRes.data) {
        const mapping: Record<string, { count: number; total: number }> = {}
        purRes.data.forEach((bill) => {
          if (!mapping[bill.supplierId]) {
            mapping[bill.supplierId] = { count: 0, total: 0 }
          }
          mapping[bill.supplierId].count += 1
          mapping[bill.supplierId].total += bill.grandTotal
        })
        setPurchaseOrdersMap(mapping)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while loading suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [searchTerm])

  const handleOpenCreate = () => {
    setDialogMode('create')
    setEditingSupplier(null)
    setFormData({
      name: '',
      code: '',
      gstin: '',
      phone: '',
      email: '',
      address: '',
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (supplier: Supplier) => {
    setDialogMode('edit')
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      code: supplier.code,
      gstin: supplier.gstin,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return
    
    try {
      const res = await api.delete(`/suppliers/${id}`)
      if (!res.success) {
        alert(res.error || 'Failed to delete supplier')
      } else {
        fetchSuppliers()
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
    if (!formData.name || !formData.code || !formData.gstin || !formData.phone || !formData.email || !formData.address) {
      setFormError('All fields are required')
      return
    }

    try {
      let res
      if (dialogMode === 'create') {
        res = await api.post('/suppliers', formData)
      } else {
        res = await api.put(`/suppliers/${editingSupplier?.id}`, formData)
      }

      if (!res.success) {
        setFormError(res.error || 'Failed to save supplier details')
      } else {
        setIsDialogOpen(false)
        fetchSuppliers()
      }
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'An error occurred while saving supplier')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier information and contacts</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Supplier List</CardTitle>
              <CardDescription>All suppliers and their details ({suppliers.length})</CardDescription>
            </div>
            <div className="w-full sm:w-80 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading suppliers...</p>
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
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Total Invoices</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground text-sm">
                        No suppliers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => {
                      const stats = purchaseOrdersMap[supplier.id] || { count: 0, total: 0 }
                      return (
                        <TableRow key={supplier.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell className="font-mono text-sm font-semibold text-primary">{supplier.code}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold">{supplier.gstin}</TableCell>
                          <TableCell className="text-sm">{supplier.email}</TableCell>
                          <TableCell className="text-sm">{supplier.phone}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{supplier.address}</TableCell>
                          <TableCell className="text-right font-semibold">{stats.count}</TableCell>
                          <TableCell className="text-right font-semibold">₹{stats.total.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                onClick={() => handleOpenEdit(supplier)} 
                                variant="ghost" 
                                size="sm" 
                                className="w-8 h-8 p-0"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(supplier.id)} 
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
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Add New Supplier' : 'Edit Supplier'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'create' 
                  ? 'Enter supplier credentials to create a new profile.' 
                  : 'Modify supplier details.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md text-red-700 dark:text-red-300 text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier Legal Name</label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Acme Corporation" 
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <label htmlFor="code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier Code</label>
                  <Input 
                    id="code" 
                    value={formData.code} 
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                    placeholder="e.g. ACM" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="gstin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GSTIN Number</label>
                  <Input 
                    id="gstin" 
                    value={formData.gstin} 
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} 
                    placeholder="e.g. 27AAAAA1111A1Z1" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Phone</label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="e.g. +91 9999999999" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Email</label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  placeholder="e.g. contact@supplier.com" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Address</label>
                <Input 
                  id="address" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="e.g. Sector 15, Mumbai, Maharashtra" 
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {dialogMode === 'create' ? 'Create Supplier' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


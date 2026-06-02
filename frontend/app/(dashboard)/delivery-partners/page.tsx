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
import { Plus, Search, Edit2, Trash2, Truck, UserCheck, ShieldAlert } from 'lucide-react'
import { api } from '@/lib/api-client'

interface DeliveryPartner {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  type: 'TRANSPORT' | 'LOCAL'
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export default function DeliveryPartnersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [partners, setPartners] = useState<DeliveryPartner[]>([])
  
  // Search query
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingPartner, setEditingPartner] = useState<DeliveryPartner | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'TRANSPORT' as 'TRANSPORT' | 'LOCAL',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get<DeliveryPartner[]>('/delivery-partners', { searchQuery: searchTerm })
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch delivery partners')
      }
      setPartners(res.data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while fetching delivery partners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [searchTerm])

  const handleOpenCreate = () => {
    setDialogMode('create')
    setEditingPartner(null)
    setFormData({
      name: '',
      phone: '',
      email: '',
      type: 'TRANSPORT',
      status: 'ACTIVE',
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (partner: DeliveryPartner) => {
    setDialogMode('edit')
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      phone: partner.phone || '',
      email: partner.email || '',
      type: partner.type,
      status: partner.status,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery partner?')) return
    
    try {
      const res = await api.delete(`/delivery-partners/${id}`)
      if (!res.success) {
        alert(res.error || 'Failed to delete delivery partner')
      } else {
        fetchPartners()
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'An error occurred while deleting delivery partner')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name) {
      setFormError('Partner name is required')
      return
    }

    try {
      let res
      if (dialogMode === 'create') {
        res = await api.post('/delivery-partners', formData)
      } else {
        res = await api.put(`/delivery-partners/${editingPartner?.id}`, formData)
      }

      if (!res.success) {
        setFormError(res.error || 'Failed to save delivery partner details')
      } else {
        setIsDialogOpen(false)
        fetchPartners()
      }
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'An error occurred while saving delivery partner')
    }
  }

  // Count aggregates
  const transportCount = partners.filter(p => p.type === 'TRANSPORT' && p.status === 'ACTIVE').length
  const localCount = partners.filter(p => p.type === 'LOCAL' && p.status === 'ACTIVE').length
  const inactiveCount = partners.filter(p => p.status === 'INACTIVE').length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Delivery Partners</h1>
          <p className="text-muted-foreground">Manage transport agencies and local delivery handlers</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Delivery Partner
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transport Partners</CardTitle>
            <Truck className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{transportCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active shipping & freight agencies</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Local Partners</CardTitle>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{localCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active local courier & staff handlers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Inactive Partners</CardTitle>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{inactiveCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Temporarily suspended partners</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Delivery Partners List</CardTitle>
              <CardDescription>Logistics and delivery contacts directory ({partners.length})</CardDescription>
            </div>
            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone..."
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
              <p className="text-sm text-muted-foreground">Loading delivery partners...</p>
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
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                        No delivery partners found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              partner.type === 'TRANSPORT' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50'
                            }
                          >
                            {partner.type === 'TRANSPORT' ? 'Transport Partner' : 'Local Partner'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{partner.phone || <span className="text-muted-foreground italic text-xs">N/A</span>}</TableCell>
                        <TableCell>{partner.email || <span className="text-muted-foreground italic text-xs">N/A</span>}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              partner.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900/50'
                                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
                            }
                          >
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenEdit(partner)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(partner.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
              <DialogTitle>{dialogMode === 'create' ? 'Add Delivery Partner' : 'Edit Delivery Partner'}</DialogTitle>
              <DialogDescription>
                Specify the details for the delivery partner.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md text-red-700 dark:text-red-300 text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Partner Name</label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. BlueDart Logistics, or John Local" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="type" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Partner Type</label>
                  <SelectNative
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="TRANSPORT">Transport Partner</option>
                    <option value="LOCAL">Local Partner</option>
                  </SelectNative>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
                  <SelectNative
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </SelectNative>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number</label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="e.g. 9876543210" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="e.g. info@bluedart.com" 
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {dialogMode === 'create' ? 'Add Partner' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

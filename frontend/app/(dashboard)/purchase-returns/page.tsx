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
import { Plus, Search, Trash } from 'lucide-react'
import { api } from '@/lib/api-client'

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  sku: string
  name: string
}

interface PurchaseItem {
  productId: string
  quantity: number
  rate: number
  product: Product
}

interface PurchaseBill {
  id: string
  supplierId: string
  invoiceNumber: string
  invoiceDate: string
  items: PurchaseItem[]
}

interface ReturnItem {
  id: string
  productId: string
  quantity: number
  rate: number
  amount: number
  reason: string
  product?: Product
}

interface PurchaseReturn {
  id: string
  supplierId: string
  purchaseBillId: string
  returnDate: string
  reason?: string | null
  totalAmount: number
  createdAt: string
  supplier: Supplier
  purchaseBill: PurchaseBill
  items: ReturnItem[]
}

const REASONS = [
  'Stitching Defect',
  'Fabric Damage',
  'Color Mismatch',
  'Size Mismatch',
  'Wrong Item',
  'Other'
]

export default function ReturnsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Lists
  const [returns, setReturns] = useState<PurchaseReturn[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [allBills, setAllBills] = useState<PurchaseBill[]>([])
  
  // Search query
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form states
  const [supplierId, setSupplierId] = useState('')
  const [purchaseBillId, setPurchaseBillId] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [overallReason, setOverallReason] = useState('')
  const [formItems, setFormItems] = useState<Array<{ productId: string; quantity: number; rate: number; reason: string }>>([
    { productId: '', quantity: 1, rate: 0, reason: 'Fabric Damage' }
  ])
  const [formError, setFormError] = useState<string | null>(null)

  // Filter bills for the selected supplier
  const filteredBills = allBills.filter((b) => b.supplierId === supplierId)
  
  // Find selected bill to list its products in row item selector
  const selectedBill = allBills.find((b) => b.id === purchaseBillId)

  const fetchReturns = async () => {
    try {
      setLoading(true)
      setError(null)
      const [retRes, supRes, billRes] = await Promise.all([
        api.get<PurchaseReturn[]>('/returns'),
        api.get<Supplier[]>('/suppliers'),
        api.get<PurchaseBill[]>('/purchases')
      ])

      if (!retRes.success) throw new Error(retRes.error || 'Failed to fetch purchase returns')
      
      setReturns(retRes.data || [])
      if (supRes.success && supRes.data) setSuppliers(supRes.data)
      if (billRes.success && billRes.data) setAllBills(billRes.data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while loading returns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  const handleOpenCreate = () => {
    setFormError(null)
    setSupplierId('')
    setPurchaseBillId('')
    setReturnDate(new Date().toISOString().split('T')[0])
    setOverallReason('')
    setFormItems([{ productId: '', quantity: 1, rate: 0, reason: 'Fabric Damage' }])
    setIsDialogOpen(true)
  }

  const handleAddItemRow = () => {
    setFormItems([...formItems, { productId: '', quantity: 1, rate: 0, reason: 'Fabric Damage' }])
  }

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length === 1) return
    setFormItems(formItems.filter((_, idx) => idx !== index))
  }

  const handleUpdateItemRow = (index: number, field: string, value: string | number) => {
    const updated = [...formItems]
    
    // If updating the product, auto-populate the rate from the invoice bill items
    if (field === 'productId' && selectedBill) {
      const billItem = selectedBill.items.find((i) => i.productId === value)
      updated[index] = {
        ...updated[index],
        productId: String(value),
        rate: billItem ? billItem.rate : 0
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      }
    }
    setFormItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!supplierId) return setFormError('Please select a supplier')
    if (!purchaseBillId) return setFormError('Please select a purchase invoice')
    if (!returnDate) return setFormError('Please select a return date')
    if (formItems.some((item) => !item.productId || item.quantity <= 0)) {
      return setFormError('Please ensure all items have a selected product and valid quantity.')
    }

    // Frontend quantity check against original invoice
    if (selectedBill) {
      for (const item of formItems) {
        const invoiceItem = selectedBill.items.find((i) => i.productId === item.productId)
        if (!invoiceItem) {
          return setFormError(`Product not found in invoice: ${item.productId}`)
        }
        
        // Calculate already returned quantity for this product from this bill
        const previouslyReturned = returns
          .filter((r) => r.purchaseBillId === purchaseBillId)
          .reduce((sum, r) => {
            const match = r.items.find((ri) => ri.productId === item.productId)
            return sum + (match ? match.quantity : 0)
          }, 0)

        const remainingQty = invoiceItem.quantity - previouslyReturned
        if (item.quantity > remainingQty) {
          return setFormError(
            `Return quantity (${item.quantity}) for product exceeds invoice remaining quantity (${remainingQty})`
          )
        }
      }
    }

    const payload = {
      supplierId,
      purchaseBillId,
      returnDate,
      reason: overallReason || 'Defective goods return',
      items: formItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        reason: item.reason
      }))
    }

    try {
      const res = await api.post('/returns', payload)
      if (!res.success) {
        setFormError(res.error || 'Failed to file return')
      } else {
        setIsDialogOpen(false)
        fetchReturns()
      }
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'An error occurred while saving purchase return')
    }
  }

  const filteredReturns = returns.filter((r) => {
    return r.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purchaseBill?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Returns Management</h1>
        <p className="text-muted-foreground">Manage purchase returns and defect logs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Purchase Returns filed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Refund Value: ₹{returns.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Refund Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{returns.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Adjusted against ledger accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Returns</CardTitle>
              <CardDescription>Returns dispatched to suppliers ({filteredReturns.length})</CardDescription>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              File Purchase Return
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by supplier name or invoice reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading purchase returns...</p>
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
                    <TableHead>Return ID</TableHead>
                    <TableHead>Ref Invoice</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Items Count</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Refund Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-sm">
                        No purchase returns recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((ret) => (
                      <TableRow key={ret.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs font-semibold">{ret.id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-sm">{ret.purchaseBill?.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{ret.supplier?.name}</TableCell>
                        <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-semibold">{ret.items?.length || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ret.reason}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">₹{ret.totalAmount.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Return Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>File Purchase Return</DialogTitle>
              <DialogDescription>
                Create a return entry to decrease stock levels and record refunds.
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
                  <label htmlFor="supplier" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</label>
                  <SelectNative
                    id="supplier"
                    value={supplierId}
                    onChange={(e) => {
                      setSupplierId(e.target.value)
                      setPurchaseBillId('')
                      setFormItems([{ productId: '', quantity: 1, rate: 0, reason: 'Fabric Damage' }])
                    }}
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </SelectNative>
                </div>
                <div className="space-y-2">
                  <label htmlFor="bill" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference Invoice</label>
                  <SelectNative
                    id="bill"
                    value={purchaseBillId}
                    disabled={!supplierId}
                    onChange={(e) => {
                      setPurchaseBillId(e.target.value)
                      setFormItems([{ productId: '', quantity: 1, rate: 0, reason: 'Fabric Damage' }])
                    }}
                  >
                    <option value="">-- Select Invoice --</option>
                    {filteredBills.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.invoiceNumber} ({new Date(b.invoiceDate).toLocaleDateString()})
                      </option>
                    ))}
                  </SelectNative>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Return Date</label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={returnDate} 
                    onChange={(e) => setReturnDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="overallReason" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Remarks</label>
                  <Input 
                    id="overallReason" 
                    value={overallReason} 
                    onChange={(e) => setOverallReason(e.target.value)} 
                    placeholder="e.g. Return of defectives" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Items to Return</label>
                <div className="space-y-2">
                  {formItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded-md bg-accent/30">
                      <div className="flex-1">
                        <SelectNative
                          value={item.productId}
                          disabled={!purchaseBillId}
                          onChange={(e) => handleUpdateItemRow(index, 'productId', e.target.value)}
                        >
                          <option value="">-- Select Product --</option>
                          {selectedBill?.items.map((i) => (
                            <option key={i.productId} value={i.productId}>
                              {i.product?.name || 'Unknown'} (Bought: {i.quantity})
                            </option>
                          ))}
                        </SelectNative>
                      </div>
                      <div className="w-16">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemRow(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="w-36">
                        <SelectNative
                          value={item.reason}
                          onChange={(e) => handleUpdateItemRow(index, 'reason', e.target.value)}
                        >
                          {REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </SelectNative>
                      </div>
                      <div className="text-sm font-semibold w-20 text-right font-mono pr-2">
                        ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveItemRow(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddItemRow}
                    disabled={!purchaseBillId}
                  >
                    + Add Return Row
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                File Return
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}



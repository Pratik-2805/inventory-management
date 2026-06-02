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
import { Plus, Search, Trash, Eye, Printer } from 'lucide-react'
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

  // View Return details state
  const [viewReturn, setViewReturn] = useState<PurchaseReturn | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-sm">
                        No purchase returns recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((ret) => (
                      <TableRow 
                        key={ret.id} 
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setViewReturn(ret)
                          setIsViewOpen(true)
                        }}
                      >
                        <TableCell className="font-mono text-xs font-semibold">{ret.id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-sm">{ret.purchaseBill?.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{ret.supplier?.name}</TableCell>
                        <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-semibold">{ret.items?.length || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{ret.reason}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">₹{ret.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setViewReturn(ret)
                              setIsViewOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
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

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block border-b pb-1">Items to Return</label>
                
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 select-none">
                  <div className="col-span-4">Product Selector</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-3">Reason</div>
                  <div className="col-span-2 text-right">Refund Value</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-2">
                  {formItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-accent/30">
                      <div className="col-span-4">
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
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemRow(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <SelectNative
                          value={item.reason}
                          onChange={(e) => handleUpdateItemRow(index, 'reason', e.target.value)}
                        >
                          {REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </SelectNative>
                      </div>
                      <div className="col-span-2 text-sm font-semibold text-right font-mono text-foreground pr-2">
                        ₹{(item.quantity * item.rate).toLocaleString('en-IN')}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveItemRow(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddItemRow}
                    disabled={!purchaseBillId}
                    className="mt-1"
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

      {/* Detailed Return Viewer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
          {viewReturn && (
            <div className="space-y-6">
              {/* Return Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                    Debit Note / Purchase Return
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mt-1">SITARA HUB</h2>
                  <p className="text-xs text-muted-foreground">Inventory Management & Supply System</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold font-mono text-foreground">Return ID: {viewReturn.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">Date: {new Date(viewReturn.returnDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Ref Invoice: <span className="font-mono font-semibold">#{viewReturn.purchaseBill?.invoiceNumber}</span></p>
                </div>
              </div>

              {/* Vendor Section */}
              <div className="bg-muted/30 p-3 rounded-lg border border-border text-sm space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Returned To (Supplier)</h3>
                <p className="font-semibold text-foreground">{viewReturn.supplier?.name}</p>
                {viewReturn.supplier?.gstin && <p className="text-xs text-muted-foreground">GSTIN: <span className="font-mono">{viewReturn.supplier.gstin}</span></p>}
                {viewReturn.supplier?.phone && <p className="text-xs text-muted-foreground">Phone: {viewReturn.supplier.phone}</p>}
                {viewReturn.supplier?.email && <p className="text-xs text-muted-foreground">Email: {viewReturn.supplier.email}</p>}
              </div>

              {/* Returned Items Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Returned items</h3>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Product details</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Refund Rate</TableHead>
                        <TableHead>Return Reason</TableHead>
                        <TableHead className="text-right">Total Refund</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewReturn.items?.map((item, idx) => (
                        <TableRow key={item.id || idx}>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{item.product?.name || 'Unknown Product'}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">SKU: {item.product?.sku || 'N/A'}</div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-sm">{item.reason}</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-red-600">₹{item.amount.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <h4 className="font-bold">Remarks:</h4>
                  <p>{viewReturn.reason || 'No overall remarks provided'}</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg border border-border text-sm flex justify-between items-center font-bold text-foreground">
                  <span>Total Refund Value:</span>
                  <span className="font-mono text-red-600 text-lg">₹{viewReturn.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => window.print()}
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button type="button" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



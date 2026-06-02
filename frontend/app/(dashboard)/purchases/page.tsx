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
  gstin?: string
  phone?: string
  email?: string
  address?: string
}

interface Product {
  id: string
  sku: string
  name: string
  gstRate: number
}

interface DeliveryPartner {
  id: string
  name: string
  phone?: string
  email?: string
  type: 'TRANSPORT' | 'LOCAL'
}

interface PurchaseItem {
  id: string
  productId: string
  quantity: number
  rate: number
  amount: number
  product?: Product
}

interface PurchaseBill {
  id: string
  supplierId: string
  deliveryPartnerId?: string | null
  trackingNumber?: string | null
  invoiceNumber: string
  purchaseCode: string
  invoiceDate: string
  taxableAmount: number
  cgst: number
  sgst: number
  igst: number
  transportCharges: number
  grandTotal: number
  createdAt: string
  supplier: Supplier
  deliveryPartner?: DeliveryPartner | null
  items: PurchaseItem[]
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<PurchaseBill[]>([])
  
  // Search query
  const [searchTerm, setSearchTerm] = useState('')
  
  // New PO dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [partners, setPartners] = useState<DeliveryPartner[]>([])

  // View Bill Modal state
  const [viewBill, setViewBill] = useState<PurchaseBill | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  
  // Form states
  const [supplierId, setSupplierId] = useState('')
  const [deliveryPartnerId, setDeliveryPartnerId] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [transportCharges, setTransportCharges] = useState(0)
  const [gstType, setGstType] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST')
  
  // Form items list
  const [formItems, setFormItems] = useState<Array<{ productId: string; quantity: number; rate: number }>>([
    { productId: '', quantity: 1, rate: 0 }
  ])
  const [formError, setFormError] = useState<string | null>(null)

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get<PurchaseBill[]>('/purchases')
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch purchase bills')
      }
      setPurchases(res.data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while fetching purchases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  const handleOpenCreate = async () => {
    setFormError(null)
    setSupplierId('')
    setDeliveryPartnerId('')
    setTrackingNumber('')
    setInvoiceNumber('')
    setInvoiceDate(new Date().toISOString().split('T')[0])
    setTransportCharges(0)
    setGstType('CGST_SGST')
    setFormItems([{ productId: '', quantity: 1, rate: 0 }])
    
    // Pre-fetch dialog options
    try {
      const [supRes, prodRes, partRes] = await Promise.all([
        api.get<Supplier[]>('/suppliers'),
        api.get<any>('/products', { limit: 100 }), // fetch a large chunk of products
        api.get<DeliveryPartner[]>('/delivery-partners')
      ])

      if (supRes.success && supRes.data) setSuppliers(supRes.data)
      if (prodRes.success && prodRes.data) setProducts(prodRes.data)
      if (partRes.success && partRes.data) setPartners(partRes.data)

      setIsDialogOpen(true)
    } catch (err) {
      console.error('Failed to load dialog options:', err)
      alert('Error: Could not retrieve suppliers or products directories')
    }
  }

  const handleAddItemRow = () => {
    setFormItems([...formItems, { productId: '', quantity: 1, rate: 0 }])
  }

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length === 1) return
    setFormItems(formItems.filter((_, idx) => idx !== index))
  }

  const handleUpdateItemRow = (index: number, field: string, value: string | number) => {
    const updated = [...formItems]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setFormItems(updated)
  }

  // Calculate live aggregates for the dialog
  const calculatedSubtotal = formItems.reduce((sum, item) => {
    return sum + (item.quantity * item.rate)
  }, 0)

  const calculatedTax = formItems.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId)
    if (!prod) return sum
    const amount = item.quantity * item.rate
    return sum + (amount * (prod.gstRate / 100))
  }, 0)

  const calculatedGrandTotal = calculatedSubtotal + calculatedTax + transportCharges

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!supplierId) return setFormError('Please select a supplier')
    if (!invoiceNumber) return setFormError('Please enter an invoice number')
    if (!invoiceDate) return setFormError('Please select an invoice date')
    if (formItems.some((item) => !item.productId || item.quantity <= 0 || item.rate <= 0)) {
      return setFormError('Please ensure all items have a selected product, valid quantity, and rate.')
    }

    const payload = {
      supplierId,
      deliveryPartnerId: deliveryPartnerId || null,
      trackingNumber: trackingNumber || null,
      invoiceNumber,
      invoiceDate,
      transportCharges,
      gstType,
      items: formItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        rate: Number(item.rate)
      }))
    }

    try {
      const res = await api.post('/purchases', payload)
      if (!res.success) {
        setFormError(res.error || 'Failed to save purchase bill')
      } else {
        setIsDialogOpen(false)
        fetchPurchases()
      }
    } catch (err: any) {
      console.error(err)
      setFormError(err.message || 'An error occurred while creating purchase invoice')
    }
  }

  const filteredPurchases = purchases.filter((p) => {
    return p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Global aggregates
  const grandTotalPurchases = purchases.reduce((sum, p) => sum + p.grandTotal, 0)
  const totalCgst = purchases.reduce((sum, p) => sum + p.cgst, 0)
  const totalSgst = purchases.reduce((sum, p) => sum + p.sgst, 0)
  const totalIgst = purchases.reduce((sum, p) => sum + p.igst, 0)
  const totalFreight = purchases.reduce((sum, p) => sum + p.transportCharges, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Purchase Management</h1>
        <p className="text-muted-foreground">Manage your purchase orders and invoices</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Invoices</CardTitle>
              <CardDescription>Record and check procurement bills ({filteredPurchases.length})</CardDescription>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading purchase bills...</p>
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
                    <TableHead>Purchase Code</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Taxable Amt</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">Freight</TableHead>
                    <TableHead className="text-right">Grand Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-6 text-muted-foreground text-sm">
                        No purchase invoices recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((bill) => (
                      <TableRow 
                        key={bill.id} 
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setViewBill(bill)
                          setIsViewOpen(true)
                        }}
                      >
                        <TableCell className="font-mono text-sm font-semibold text-primary">{bill.purchaseCode}</TableCell>
                        <TableCell className="font-mono text-sm">{bill.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{bill.supplier?.name}</TableCell>
                        <TableCell>{new Date(bill.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">₹{bill.taxableAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.cgst.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.sgst.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.igst.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.transportCharges.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold">₹{bill.grandTotal.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setViewBill(bill)
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

      <Card>
        <CardHeader>
          <CardTitle>Purchase Summary</CardTitle>
          <CardDescription>Total values and breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="text-2xl font-bold mt-1">₹{grandTotalPurchases.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total CGST</p>
              <p className="text-2xl font-bold mt-1">₹{totalCgst.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total SGST</p>
              <p className="text-2xl font-bold mt-1">₹{totalSgst.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total IGST</p>
              <p className="text-2xl font-bold mt-1">₹{totalIgst.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Freight</p>
              <p className="text-2xl font-bold mt-1">₹{totalFreight.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Recorder Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Record Purchase Bill</DialogTitle>
              <DialogDescription>
                Record incoming stock by submitting details from the supplier invoice.
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
                  <label htmlFor="supplier" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Supplier</label>
                  <SelectNative
                    id="supplier"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </SelectNative>
                </div>
                <div className="space-y-2">
                  <label htmlFor="invoice" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Invoice Number</label>
                  <Input 
                    id="invoice" 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)} 
                    placeholder="e.g. GST-INV-2947" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Purchase Date</label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gstType" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">GST Structure</label>
                  <SelectNative
                    id="gstType"
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value as any)}
                  >
                    <option value="CGST_SGST">Intrastate (CGST + SGST)</option>
                    <option value="IGST">Interstate (IGST)</option>
                  </SelectNative>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="partner" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Delivery Partner (Optional)</label>
                  <SelectNative
                    id="partner"
                    value={deliveryPartnerId}
                    onChange={(e) => setDeliveryPartnerId(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type === 'TRANSPORT' ? 'Transport' : 'Local'})
                      </option>
                    ))}
                  </SelectNative>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tracking" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Tracking ID (Optional)</label>
                  <Input 
                    id="tracking" 
                    value={trackingNumber} 
                    onChange={(e) => setTrackingNumber(e.target.value)} 
                    placeholder="e.g. TRK924823" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Invoice Items</label>
                
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 select-none">
                  <div className="col-span-4">Product Selector</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Rate (₹)</div>
                  <div className="col-span-1 text-center">GST</div>
                  <div className="col-span-2 text-right">Line Total</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-2">
                  {formItems.map((item, index) => {
                    const selectedProd = products.find((p) => p.id === item.productId)
                    const itemGst = selectedProd ? selectedProd.gstRate : 0
                    
                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-accent/30">
                        <div className="col-span-4">
                          <SelectNative
                            value={item.productId}
                            onChange={(e) => handleUpdateItemRow(index, 'productId', e.target.value)}
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
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
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => handleUpdateItemRow(index, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-1 text-xs text-muted-foreground text-center font-mono font-medium">
                          {itemGst}%
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
                    )
                  })}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow} className="mt-1">
                    + Add Product Row
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label htmlFor="freight" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Freight / Transport Charges</label>
                  <Input 
                    id="freight" 
                    type="number" 
                    value={transportCharges} 
                    onChange={(e) => setTransportCharges(Number(e.target.value))} 
                    placeholder="e.g. 500" 
                  />
                </div>
                <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 border border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold font-mono">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST Tax Value:</span>
                    <span className="font-semibold font-mono">₹{calculatedTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-1.5 text-foreground">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary">₹{calculatedGrandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Record Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detailed Invoice Viewer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-6">
          {viewBill && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    Purchase Order: {viewBill.purchaseCode}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mt-1">SITARA HUB</h2>
                  <p className="text-xs text-muted-foreground">Inventory Management & Supply System</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold font-mono text-foreground">Inv: #{viewBill.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">Date: {new Date(viewBill.invoiceDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Recorded: {new Date(viewBill.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Vendor & Delivery Partner details */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vendor / Supplier</h3>
                  <p className="font-semibold text-foreground">{viewBill.supplier?.name}</p>
                  {viewBill.supplier?.gstin && <p className="text-xs text-muted-foreground font-semibold">GSTIN: <span className="font-mono">{viewBill.supplier.gstin}</span></p>}
                  {viewBill.supplier?.phone && <p className="text-xs text-muted-foreground">Phone: {viewBill.supplier.phone}</p>}
                  {viewBill.supplier?.email && <p className="text-xs text-muted-foreground">Email: {viewBill.supplier.email}</p>}
                  {viewBill.supplier?.address && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{viewBill.supplier.address}</p>}
                </div>

                <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Partner Info</h3>
                    {viewBill.deliveryPartner ? (
                      <div>
                        <p className="font-semibold text-foreground">{viewBill.deliveryPartner.name}</p>
                        <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                          {viewBill.deliveryPartner.type === 'TRANSPORT' ? 'Transport Partner' : 'Local Courier'}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No delivery partner assigned</p>
                    )}
                  </div>
                  {viewBill.trackingNumber && (
                    <div className="pt-1.5 border-t border-border/60">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tracking ID</h4>
                      <p className="text-xs font-semibold font-mono mt-0.5 text-foreground">{viewBill.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Purchased Products</h3>
                <div className="border rounded-lg overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Product details</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Purchase Rate</TableHead>
                        <TableHead className="text-right">GST Rate</TableHead>
                        <TableHead className="text-right">Total (Excl. Tax)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewBill.items.map((item, idx) => {
                        const gstRate = item.product?.gstRate || 0
                        const baseAmount = item.quantity * item.rate
                        return (
                          <TableRow key={item.id || idx}>
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium text-foreground">{item.product?.name || 'Unknown Product'}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">SKU: {item.product?.sku || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium">{item.quantity}</TableCell>
                            <TableCell className="text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">{gstRate}%</TableCell>
                            <TableCell className="text-right font-mono font-semibold">₹{baseAmount.toLocaleString('en-IN')}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Tax & Financial Breakdown */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="text-xs text-muted-foreground flex flex-col justify-end">
                  <p>* This is a system generated purchase receipt recorded against stock acquisitions. Please cross-reference with supplier paper invoice.</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold font-mono">₹{viewBill.taxableAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {viewBill.cgst > 0 && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>CGST:</span>
                      <span className="font-mono">₹{viewBill.cgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {viewBill.sgst > 0 && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>SGST:</span>
                      <span className="font-mono">₹{viewBill.sgst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {viewBill.igst > 0 && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>IGST:</span>
                      <span className="font-mono">₹{viewBill.igst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {viewBill.transportCharges > 0 && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>Freight & Transport:</span>
                      <span className="font-mono">₹{viewBill.transportCharges.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t pt-2 text-foreground">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary">₹{viewBill.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
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



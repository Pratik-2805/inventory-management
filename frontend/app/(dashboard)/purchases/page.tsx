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
  gstRate: number
}

interface DeliveryPartner {
  id: string
  name: string
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
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Taxable Amt</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">Freight</TableHead>
                    <TableHead className="text-right">Grand Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground text-sm">
                        No purchase invoices recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm font-semibold">{bill.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{bill.supplier?.name}</TableCell>
                        <TableCell>{new Date(bill.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">₹{bill.taxableAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.cgst.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.sgst.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.igst.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{bill.transportCharges.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right font-semibold">₹{bill.grandTotal.toLocaleString('en-IN')}</TableCell>
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
                  <label htmlFor="supplier" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</label>
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
                  <label htmlFor="invoice" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice Number</label>
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
                  <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purchase Date</label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={invoiceDate} 
                    onChange={(e) => setInvoiceDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gstType" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GST Structure</label>
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
                  <label htmlFor="partner" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Partner (Optional)</label>
                  <SelectNative
                    id="partner"
                    value={deliveryPartnerId}
                    onChange={(e) => setDeliveryPartnerId(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </SelectNative>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tracking" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking ID (Optional)</label>
                  <Input 
                    id="tracking" 
                    value={trackingNumber} 
                    onChange={(e) => setTrackingNumber(e.target.value)} 
                    placeholder="e.g. TRK924823" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Invoice Items</label>
                <div className="space-y-2">
                  {formItems.map((item, index) => {
                    const selectedProd = products.find((p) => p.id === item.productId)
                    const itemGst = selectedProd ? selectedProd.gstRate : 0
                    
                    return (
                      <div key={index} className="flex gap-2 items-center p-2 border rounded-md bg-accent/30">
                        <div className="flex-1">
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
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemRow(index, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => handleUpdateItemRow(index, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground w-16 text-center font-mono">
                          {itemGst}% GST
                        </div>
                        <div className="text-sm font-semibold w-20 text-right font-mono">
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
                    )
                  })}
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>
                    + Add Product Row
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <label htmlFor="freight" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Freight / Transport Charges</label>
                  <Input 
                    id="freight" 
                    type="number" 
                    value={transportCharges} 
                    onChange={(e) => setTransportCharges(Number(e.target.value))} 
                    placeholder="e.g. 500" 
                  />
                </div>
                <div className="p-3 bg-muted/30 rounded-md space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tax:</span>
                    <span>₹{calculatedTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-1">
                    <span>Grand Total:</span>
                    <span>₹{calculatedGrandTotal.toLocaleString('en-IN')}</span>
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
    </div>
  )
}



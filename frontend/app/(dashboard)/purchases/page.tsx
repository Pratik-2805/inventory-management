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
  hsnCode: string
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
  discount: number
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
  discount: number
  roundOff: number
  remarks?: string | null
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
  const [discount, setDiscount] = useState(0)
  const [roundOff, setRoundOff] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [gstType, setGstType] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST')
  
  // Form items list
  const [formItems, setFormItems] = useState<Array<{
    productId: string
    sku: string
    name: string
    hsnCode: string
    gstRate: number
    quantity: number
    rate: number
    discount: number
  }>>([
    { productId: '', sku: '', name: '', hsnCode: '', gstRate: 18, quantity: 1, rate: 0, discount: 0 }
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
    setDiscount(0)
    setRoundOff(0)
    setRemarks('')
    setGstType('CGST_SGST')
    setFormItems([{ productId: '', sku: '', name: '', hsnCode: '', gstRate: 18, quantity: 1, rate: 0, discount: 0 }])
    
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
    setFormItems([...formItems, { productId: '', sku: '', name: '', hsnCode: '', gstRate: 18, quantity: 1, rate: 0, discount: 0 }])
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

  const supplierCode = suppliers.find(s => s.id === supplierId)?.code || ''

  const handleProductSelect = (index: number, pId: string) => {
    const updated = [...formItems]
    if (!pId) {
      updated[index] = {
        ...updated[index],
        productId: '',
        sku: '',
        name: '',
        hsnCode: '',
        gstRate: 18
      }
      setFormItems(updated)
      return
    }

    const prod = products.find(p => p.id === pId)
    if (prod) {
      const prefix = supplierCode ? supplierCode + '-' : ''
      const skuSuffix = (supplierCode && prod.sku.startsWith(prefix)) 
        ? prod.sku.substring(prefix.length) 
        : prod.sku

      updated[index] = {
        ...updated[index],
        productId: prod.id,
        sku: skuSuffix || '',
        name: prod.name || '',
        hsnCode: prod.hsnCode || '',
        gstRate: prod.gstRate || 0
      }
      setFormItems(updated)
    }
  }

  // Calculate live aggregates for the dialog (subtotal is sum of row final prices after row discount)
  const calculatedSubtotal = formItems.reduce((sum, item) => {
    const rowBase = item.quantity * item.rate
    const rowFinal = Math.max(0, rowBase - (item.discount || 0))
    return sum + rowFinal
  }, 0)

  const calculatedTax = formItems.reduce((sum, item) => {
    const rowBase = item.quantity * item.rate
    const rowFinal = Math.max(0, rowBase - (item.discount || 0))
    // Distribute global discount proportionally
    const itemGlobalDiscount = calculatedSubtotal > 0 ? (discount * (rowFinal / calculatedSubtotal)) : 0
    const taxableAmount = Math.max(0, rowFinal - itemGlobalDiscount)
    return sum + (taxableAmount * ((item.gstRate || 0) / 100))
  }, 0)

  const calculatedGrandTotal = (calculatedSubtotal - discount) + calculatedTax + transportCharges + roundOff

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!supplierId) return setFormError('Please select a supplier')
    if (!invoiceNumber) return setFormError('Please enter an invoice number')
    if (!invoiceDate) return setFormError('Please select an invoice date')
    if (formItems.some((item) => !item.sku.trim() || !item.name.trim() || !item.hsnCode.trim() || item.quantity <= 0 || item.rate <= 0)) {
      return setFormError('Please ensure all items have a valid Product Code (SKU), Name, HSN Code, quantity, and rate.')
    }

    const payload = {
      supplierId,
      deliveryPartnerId: deliveryPartnerId || null,
      trackingNumber: trackingNumber || null,
      invoiceNumber,
      invoiceDate,
      transportCharges,
      discount,
      roundOff,
      remarks: remarks || null,
      gstType,
      items: formItems.map((item) => ({
        productId: item.productId || null,
        sku: `${supplierCode}-${item.sku.trim()}`,
        name: item.name.trim(),
        hsnCode: item.hsnCode.trim(),
        gstRate: Number(item.gstRate),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        discount: Number(item.discount || 0)
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
        <DialogContent fullScreen className="p-0 flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Sticky Header */}
            <div className="border-b px-8 py-5 bg-background flex flex-col gap-1.5 shrink-0 pr-16">
              <DialogTitle className="text-2xl font-bold">Record Purchase Bill</DialogTitle>
              <DialogDescription className="text-sm">
                Record incoming stock by submitting details from the supplier invoice.
              </DialogDescription>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md text-red-700 dark:text-red-300 text-sm">
                  {formError}
                </div>
              )}

              {/* Grid 1: Basic Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {/* Grid 2: Delivery & Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Invoice Items Area */}
              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Invoice Items</label>
                
                {/* Column Headers */}
                <div 
                  className="grid gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-2 select-none items-center"
                  style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                >
                  <div style={{ gridColumn: 'span 3' }}>Autofill</div>
                  <div style={{ gridColumn: 'span 4' }}>Product Code (SKU)</div>
                  <div style={{ gridColumn: 'span 4' }}>Product Name</div>
                  <div style={{ gridColumn: 'span 2' }} className="text-center">HSN Code</div>
                  <div style={{ gridColumn: 'span 2' }} className="text-center">Qty</div>
                  <div style={{ gridColumn: 'span 2' }} className="text-right">Rate (₹)</div>
                  <div style={{ gridColumn: 'span 2' }} className="text-right">Disc (₹)</div>
                  <div style={{ gridColumn: 'span 2' }} className="text-center">GST %</div>
                  <div style={{ gridColumn: 'span 2' }} className="text-right pr-2">Final Price</div>
                  <div style={{ gridColumn: 'span 1' }}></div>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, index) => {
                    const rowBase = item.quantity * item.rate
                    const rowFinal = Math.max(0, rowBase - (item.discount || 0))
                    
                    return (
                      <div 
                        key={index} 
                        className="grid gap-2 items-center p-3 border rounded-lg bg-accent/25 hover:bg-accent/40 transition-colors"
                        style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                      >
                        {/* Auto-Fill Select dropdown */}
                        <div style={{ gridColumn: 'span 3' }}>
                          <SelectNative
                            value={item.productId}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                          >
                            <option value="">-- Autofill --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </SelectNative>
                        </div>

                        {/* Product Code (SKU) input with supplier code prepend */}
                        <div style={{ gridColumn: 'span 4' }} className="flex items-stretch">
                          {supplierCode ? (
                            <span className="inline-flex items-center px-2.5 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-xs font-semibold select-none shrink-0 font-mono">
                              {supplierCode}-
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-xs font-semibold select-none shrink-0 font-mono">
                              ?—
                            </span>
                          )}
                          <Input
                            placeholder="CODE"
                            value={item.sku || ''}
                            disabled={!supplierId}
                            onChange={(e) => handleUpdateItemRow(index, 'sku', e.target.value.toUpperCase())}
                            className="rounded-l-none uppercase font-mono"
                          />
                        </div>

                        {/* Product Name */}
                        <div style={{ gridColumn: 'span 4' }}>
                          <Input
                            placeholder="Product Name"
                            value={item.name || ''}
                            onChange={(e) => handleUpdateItemRow(index, 'name', e.target.value)}
                          />
                        </div>

                        {/* HSN Code */}
                        <div style={{ gridColumn: 'span 2' }}>
                          <Input
                            placeholder="HSN"
                            value={item.hsnCode || ''}
                            onChange={(e) => handleUpdateItemRow(index, 'hsnCode', e.target.value.replace(/[^0-9]/g, ''))}
                            className="text-center font-mono"
                          />
                        </div>

                        {/* Qty */}
                        <div style={{ gridColumn: 'span 2' }}>
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity || ''}
                            onChange={(e) => handleUpdateItemRow(index, 'quantity', Number(e.target.value))}
                            className="text-center"
                          />
                        </div>

                        {/* Rate */}
                        <div style={{ gridColumn: 'span 2' }}>
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={item.rate || ''}
                            onChange={(e) => handleUpdateItemRow(index, 'rate', Number(e.target.value))}
                            className="text-right"
                          />
                        </div>

                        {/* Discount */}
                        <div style={{ gridColumn: 'span 2' }}>
                          <Input
                            type="number"
                            placeholder="Disc"
                            value={item.discount || ''}
                            onChange={(e) => handleUpdateItemRow(index, 'discount', Number(e.target.value))}
                            className="text-right"
                          />
                        </div>

                        {/* GST % */}
                        <div style={{ gridColumn: 'span 2' }}>
                          <SelectNative
                            value={item.gstRate}
                            onChange={(e) => handleUpdateItemRow(index, 'gstRate', Number(e.target.value))}
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </SelectNative>
                        </div>

                        {/* Final Price */}
                        <div style={{ gridColumn: 'span 2' }} className="text-base font-bold text-right font-mono text-foreground pr-2">
                          ₹{rowFinal.toLocaleString('en-IN')}
                        </div>

                        {/* Delete Button */}
                        <div style={{ gridColumn: 'span 1' }} className="flex justify-end">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveItemRow(index)}
                            className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  <Button type="button" variant="outline" onClick={handleAddItemRow} className="mt-1">
                    + Add Product Row
                  </Button>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="border-t bg-muted/30 px-8 py-5 shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Left: Inputs for Discount, Freight, Round Off, Remarks */}
                <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="discount" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Disc (₹)</label>
                    <Input 
                      id="discount" 
                      type="number" 
                      value={discount} 
                      onChange={(e) => setDiscount(Number(e.target.value))} 
                      placeholder="0" 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="freight" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Freight (₹)</label>
                    <Input 
                      id="freight" 
                      type="number" 
                      value={transportCharges} 
                      onChange={(e) => setTransportCharges(Number(e.target.value))} 
                      placeholder="0" 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="roundOff" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Round Off (₹)</label>
                    <Input 
                      id="roundOff" 
                      type="number" 
                      step="0.01"
                      value={roundOff} 
                      onChange={(e) => setRoundOff(Number(e.target.value))} 
                      placeholder="0.00" 
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="remarks" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Remarks / Notes</label>
                    <Input 
                      id="remarks" 
                      value={remarks} 
                      onChange={(e) => setRemarks(e.target.value)} 
                      placeholder="Invoice Notes" 
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Center / Right: Summary & Buttons */}
                <div className="w-full md:w-1/3 flex flex-row items-center gap-6 justify-end">
                  <div className="w-full sm:w-64 bg-background/80 backdrop-blur-sm p-4 border rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items Subtotal:</span>
                      <span className="font-semibold font-mono">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-red-500 font-medium">
                        <span>Global Discount:</span>
                        <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxable Subtotal:</span>
                      <span className="font-semibold font-mono">₹{(calculatedSubtotal - discount).toLocaleString('en-IN')}</span>
                    </div>
                    {gstType === 'IGST' ? (
                      <div className="flex justify-between text-muted-foreground">
                        <span>IGST:</span>
                        <span className="font-semibold font-mono">₹{calculatedTax.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-muted-foreground">
                          <span>CGST:</span>
                          <span className="font-semibold font-mono">₹{(calculatedTax / 2).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>SGST:</span>
                          <span className="font-semibold font-mono">₹{(calculatedTax / 2).toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    )}
                    {transportCharges > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Freight:</span>
                        <span className="font-semibold font-mono">₹{transportCharges.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {Math.abs(roundOff) > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Round Off:</span>
                        <span className="font-semibold font-mono">
                          {roundOff >= 0 ? '+' : ''}₹{roundOff.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2 text-foreground">
                      <span>Grand Total:</span>
                      <span className="font-mono text-primary">₹{calculatedGrandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end sm:self-center">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Record Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detailed Invoice Viewer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent fullScreen className="p-0 flex flex-col">
          {viewBill && (
            <div className="flex flex-col h-full">
              {/* Sticky Header */}
              <div className="border-b px-8 py-5 bg-background flex justify-between items-center shrink-0 pr-16">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    Purchase Order: {viewBill.purchaseCode}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mt-1">SITARA HUB</h2>
                  <p className="text-xs text-muted-foreground">Inventory Management & Supply System</p>
                </div>
                <div className="text-right space-y-1 pr-4">
                  <p className="text-sm font-semibold font-mono text-foreground">Inv: #{viewBill.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">Date: {new Date(viewBill.invoiceDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">Recorded: {new Date(viewBill.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Vendor & Delivery Partner details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Vendor / Supplier</h3>
                    <p className="font-semibold text-foreground text-base">{viewBill.supplier?.name}</p>
                    {viewBill.supplier?.gstin && <p className="text-xs text-muted-foreground font-semibold">GSTIN: <span className="font-mono">{viewBill.supplier.gstin}</span></p>}
                    {viewBill.supplier?.phone && <p className="text-xs text-muted-foreground">Phone: {viewBill.supplier.phone}</p>}
                    {viewBill.supplier?.email && <p className="text-xs text-muted-foreground">Email: {viewBill.supplier.email}</p>}
                    {viewBill.supplier?.address && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{viewBill.supplier.address}</p>}
                  </div>

                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Delivery Partner Info</h3>
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
                      <div className="pt-2 border-t border-border/60">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tracking ID</h4>
                        <p className="text-xs font-semibold font-mono mt-0.5 text-foreground">{viewBill.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">Purchased Products</h3>
                  <div className="border rounded-lg overflow-hidden bg-background">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="w-12 text-center">#</TableHead>
                          <TableHead>Product Details</TableHead>
                          <TableHead className="text-center">HSN Code</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                          <TableHead className="text-right">GST Rate</TableHead>
                          <TableHead className="text-right">Final Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewBill.items.map((item, idx) => {
                          const gstRate = item.product?.gstRate || 0
                          return (
                            <TableRow key={item.id || idx}>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">{idx + 1}</TableCell>
                              <TableCell>
                                <div className="font-medium text-foreground">{item.product?.name || 'Unknown Product'}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">SKU: {item.product?.sku || 'N/A'}</div>
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">{item.product?.hsnCode || '—'}</TableCell>
                              <TableCell className="text-right font-mono font-medium">{item.quantity}</TableCell>
                              <TableCell className="text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</TableCell>
                              <TableCell className="text-right font-mono text-red-500">₹{(item.discount || 0).toLocaleString('en-IN')}</TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">{gstRate}%</TableCell>
                              <TableCell className="text-right font-mono font-semibold">₹{item.amount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="border-t bg-muted/30 px-8 py-5 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Left: Notes */}
                  <div className="w-full md:w-1/2 space-y-2">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Invoice Notes / Remarks:</h4>
                    <p className="text-xs leading-relaxed italic text-foreground bg-background p-3 rounded-lg border border-border">
                      {viewBill.remarks || "No invoice remarks recorded."}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-normal mt-2">* This is a system generated purchase receipt recorded against stock acquisitions. Please cross-reference with supplier paper invoice.</p>
                  </div>

                  {/* Right: Calculations & Actions */}
                  <div className="w-full md:w-1/2 flex flex-col sm:flex-row items-center gap-6 justify-end">
                    <div className="w-full sm:w-64 bg-background/80 backdrop-blur-sm p-4 border rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold font-mono">₹{viewBill.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-IN')}</span>
                      </div>
                      {viewBill.discount > 0 && (
                        <div className="flex justify-between text-red-500 font-medium">
                          <span>Discount:</span>
                          <span className="font-mono">-₹{viewBill.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Taxable Subtotal:</span>
                        <span className="font-semibold font-mono">₹{viewBill.taxableAmount.toLocaleString('en-IN')}</span>
                      </div>
                      {viewBill.cgst > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>CGST:</span>
                          <span className="font-mono">₹{viewBill.cgst.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {viewBill.sgst > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>SGST:</span>
                          <span className="font-mono">₹{viewBill.sgst.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {viewBill.igst > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>IGST:</span>
                          <span className="font-mono">₹{viewBill.igst.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {viewBill.transportCharges > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Freight:</span>
                          <span className="font-mono">₹{viewBill.transportCharges.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {Math.abs(viewBill.roundOff) > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Round Off:</span>
                          <span className="font-mono">
                            {viewBill.roundOff >= 0 ? '+' : ''}₹{viewBill.roundOff.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold border-t pt-2 text-foreground">
                        <span>Grand Total:</span>
                        <span className="font-mono text-primary">₹{viewBill.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center">
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
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



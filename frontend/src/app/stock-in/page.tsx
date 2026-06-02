"use client";

import { useEffect, useState } from "react";
import { getSuppliers } from "@/actions/suppliers";
import { getProducts } from "@/actions/products";
import { getDeliveryPartners } from "@/actions/delivery-partners";
import { createPurchaseBill, getPurchaseBills } from "@/actions/purchases";
import { Plus, Calendar, Trash2, ShieldAlert, Loader2, Eye, X, Truck, Landmark } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  gstin: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  gstRate: number;
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface PurchaseItemInput {
  productId: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
}

interface PurchaseBillItem {
  id: string;
  productId: string;
  quantity: number;
  rate: number;
  amount: number;
  product: {
    sku: string;
    name: string;
  };
}

interface PurchaseBill {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  transportCharges: number;
  grandTotal: number;
  supplier: {
    name: string;
    gstin: string;
  };
  deliveryPartner?: {
    name: string;
    phone: string;
  } | null;
  trackingNumber?: string | null;
  items: PurchaseBillItem[];
}

export default function StockInPage() {
  const [bills, setBills] = useState<PurchaseBill[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form States
  const [supplierId, setSupplierId] = useState("");
  const [deliveryPartnerId, setDeliveryPartnerId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [gstType, setGstType] = useState<"CGST_SGST" | "IGST">("CGST_SGST");
  const [items, setItems] = useState<PurchaseItemInput[]>([
    { productId: "", quantity: 1, rate: 0, amount: 0, gstRate: 0 }
  ]);
  const [transportCharges, setTransportCharges] = useState<number>(0);
  
  // Dialog / Details States
  const [selectedBill, setSelectedBill] = useState<PurchaseBill | null>(null);

  // Submitting States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [billsRes, suppliersRes, productsRes, partnersRes] = await Promise.all([
      getPurchaseBills(),
      getSuppliers(),
      getProducts({ limit: 100 }),
      getDeliveryPartners()
    ]);

    if (billsRes.success && billsRes.data) {
      setBills(billsRes.data as unknown as PurchaseBill[]);
    }
    if (suppliersRes.success && suppliersRes.data) {
      setSuppliers(suppliersRes.data);
    }
    if (productsRes.success && productsRes.data) {
      setProducts(productsRes.data);
    }
    if (partnersRes.success && partnersRes.data) {
      // Show only ACTIVE partners in dropdown
      const activePartners = (partnersRes.data as DeliveryPartner[]).filter((p) => p.status === "ACTIVE");
      setDeliveryPartners(activePartners);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", quantity: 1, rate: 0, amount: 0, gstRate: 0 }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemInput, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };

      if (field === "productId") {
        const prod = products.find((p) => p.id === (value as string));
        row.productId = value as string;
        row.gstRate = prod ? prod.gstRate : 0;
      } else if (field === "quantity") {
        row.quantity = parseInt(String(value)) || 0;
      } else if (field === "rate") {
        row.rate = parseFloat(String(value)) || 0;
      }

      row.amount = row.quantity * row.rate;
      updated[index] = row;
      return updated;
    });
  };

  // Calculations
  const calculatedTaxable = items.reduce((sum, item) => sum + item.amount, 0);
  
  let calculatedCgst = 0;
  let calculatedSgst = 0;
  let calculatedIgst = 0;

  items.forEach((item) => {
    const itemGst = item.amount * (item.gstRate / 100);
    if (gstType === "IGST") {
      calculatedIgst += itemGst;
    } else {
      calculatedCgst += itemGst / 2;
      calculatedSgst += itemGst / 2;
    }
  });

  const calculatedGrandTotal = calculatedTaxable + calculatedCgst + calculatedSgst + calculatedIgst + transportCharges;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validate entries
    if (!supplierId) {
      setError("Please select a supplier.");
      setSubmitting(false);
      return;
    }
    if (items.some((item) => !item.productId)) {
      setError("Please select a product for all rows.");
      setSubmitting(false);
      return;
    }
    if (items.some((item) => item.quantity <= 0 || item.rate <= 0)) {
      setError("Quantity and rate must be greater than zero.");
      setSubmitting(false);
      return;
    }

    const payload = {
      supplierId,
      deliveryPartnerId: deliveryPartnerId || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      gstType,
      transportCharges,
      items: items.map(({ productId, quantity, rate }) => ({
        productId,
        quantity,
        rate
      }))
    };

    const res = await createPurchaseBill(payload);
    setSubmitting(false);

    if (res.success) {
      setSuccessMessage("Purchase Bill recorded and stock updated!");
      setIsCreating(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setError(res.error || "Failed to record purchase bill");
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setDeliveryPartnerId("");
    setTrackingNumber("");
    setInvoiceNumber("");
    setInvoiceDate("");
    setItems([{ productId: "", quantity: 1, rate: 0, amount: 0, gstRate: 0 }]);
    setTransportCharges(0);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stock In (Purchases)</h2>
          <p className="text-sm text-muted-foreground">
            Record supplier purchase invoices with logistics tracking.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
            New Purchase Invoice
          </button>
        )}
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-medium animate-in fade-in duration-200">
          {successMessage}
        </div>
      )}

      {isCreating ? (
        /* Create Purchase Form */
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="text-lg font-bold border-b border-border pb-3 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-500" />
              Invoice Header Details
            </h3>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Supplier
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                  className="input-field text-xs"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.gstin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Invoice Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-9213"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Invoice Date
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  GST Type
                </label>
                <select
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value as "CGST_SGST" | "IGST")}
                  className="input-field text-xs"
                >
                  <option value="CGST_SGST">Intra-State (CGST + SGST)</option>
                  <option value="IGST">Inter-State (IGST)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Delivery Partner
                </label>
                <select
                  value={deliveryPartnerId}
                  onChange={(e) => setDeliveryPartnerId(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="">No Courier Partner</option>
                  {deliveryPartners.map((dp) => (
                    <option key={dp.id} value={dp.id}>
                      {dp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRK-72124"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  disabled={!deliveryPartnerId}
                  className="input-field text-xs disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold">Purchase Items</h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    <th className="py-2 pr-4 font-semibold w-1/3">Product (SKU)</th>
                    <th className="py-2 px-4 font-semibold w-1/6">Quantity</th>
                    <th className="py-2 px-4 font-semibold w-1/6">Rate (₹)</th>
                    <th className="py-2 px-4 font-semibold w-1/6 text-right">GST Rate</th>
                    <th className="py-2 px-4 font-semibold w-1/6 text-right">Amount (₹)</th>
                    <th className="py-2 pl-4 font-semibold text-right w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-muted/10">
                      <td className="py-3 pr-4">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          required
                          className="input-field text-xs"
                        >
                          <option value="">Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} - {p.name} ({p.gstRate}%)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="input-field text-xs"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min={0.01}
                          required
                          placeholder="0.00"
                          value={item.rate || ""}
                          onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                          className="input-field text-xs"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs">
                        {item.gstRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-semibold font-mono">
                        ₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          disabled={items.length === 1}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl space-y-4 md:col-start-3">
              <h3 className="text-lg font-bold border-b border-border pb-3">Invoice Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxable Amount</span>
                  <span className="font-mono">₹{calculatedTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {gstType === "CGST_SGST" ? (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST</span>
                      <span className="font-mono">₹{calculatedCgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST</span>
                      <span className="font-mono">₹{calculatedSgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-muted-foreground">
                    <span>IGST</span>
                    <span className="font-mono">₹{calculatedIgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Transport Charges (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={transportCharges || ""}
                    onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                    className="input-field text-xs text-right font-mono"
                    placeholder="0.00"
                  />
                </div>

                <div className="border-t border-border pt-4 mt-2 flex justify-between font-bold text-lg text-foreground">
                  <span>Grand Total</span>
                  <span className="text-indigo-500 font-mono">₹{calculatedGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Invoice"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Purchase Bills List */
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Invoice No</th>
                  <th className="px-6 py-4 font-semibold">Supplier Details</th>
                  <th className="px-6 py-4 font-semibold">Logistics Details</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Taxable</th>
                  <th className="px-6 py-4 font-semibold text-right">Grand Total</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                        Loading purchase invoices...
                      </div>
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No purchase bills recorded yet. Click &quot;New Purchase Invoice&quot; to stock-in items.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-foreground text-xs">
                        #{bill.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 space-y-0.5">
                        <div className="font-semibold text-xs">{bill.supplier.name}</div>
                        <div className="text-[10px] text-muted-foreground">GSTIN: {bill.supplier.gstin}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {bill.deliveryPartner ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Truck className="h-3.5 w-3.5 text-indigo-500" />
                            <span>
                              {bill.deliveryPartner.name}
                              {bill.trackingNumber && ` (${bill.trackingNumber})`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Self-Carried</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(bill.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs">
                        ₹{bill.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-indigo-500 text-xs">
                        ₹{bill.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="btn-secondary text-xs flex items-center gap-1.5 ml-auto py-1 px-2.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden animate-modal">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Invoice #{selectedBill.invoiceNumber} Details</h3>
                <p className="text-xs text-muted-foreground">Supplier: {selectedBill.supplier.name}</p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-muted/40 p-4 rounded-lg">
                <div>
                  <span className="text-muted-foreground block">Invoice Date</span>
                  <span className="font-semibold">{new Date(selectedBill.invoiceDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Supplier GSTIN</span>
                  <span className="font-semibold font-mono">{selectedBill.supplier.gstin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Delivery Partner</span>
                  <span className="font-semibold">{selectedBill.deliveryPartner?.name || "Self-Carried"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tracking Number</span>
                  <span className="font-semibold font-mono">{selectedBill.trackingNumber || "-"}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted font-bold border-b border-border">
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedBill.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/10">
                        <td className="p-3 font-mono font-semibold text-indigo-500">{item.product.sku}</td>
                        <td className="p-3">{item.product.name}</td>
                        <td className="p-3 text-right font-semibold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">₹{item.rate.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-semibold">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxable value:</span>
                    <span className="font-mono">₹{selectedBill.taxableAmount.toLocaleString()}</span>
                  </div>
                  {selectedBill.igst > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IGST:</span>
                      <span className="font-mono">₹{selectedBill.igst.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CGST:</span>
                        <span className="font-mono">₹{selectedBill.cgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SGST:</span>
                        <span className="font-mono">₹{selectedBill.sgst.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport Charges:</span>
                    <span className="font-mono">₹{selectedBill.transportCharges.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-indigo-600/10 rounded-lg p-4 flex flex-col justify-center items-end border border-indigo-600/20">
                  <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-bold font-mono text-indigo-500">₹{selectedBill.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

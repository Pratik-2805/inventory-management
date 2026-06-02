"use client";

import { useEffect, useState, useMemo } from "react";
import { getSuppliers } from "@/actions/suppliers";
import { getPurchaseBills } from "@/actions/purchases";
import { getPurchaseReturns, createPurchaseReturn } from "@/actions/returns";
import { Plus, Search, Calendar, Landmark, RotateCcw, AlertOctagon, Trash2, ShieldAlert, Loader2, Eye, X, ArrowLeft } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  gstin: string;
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
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  grandTotal: number;
  items: PurchaseBillItem[];
}

interface ReturnItemInput {
  productId: string;
  sku: string;
  name: string;
  purchasedQty: number;
  rate: number;
  returnQty: number;
  reason: "Stitching Defect" | "Fabric Damage" | "Color Mismatch" | "Size Mismatch" | "Wrong Item" | "Other";
}

interface PurchaseReturnItem {
  id: string;
  productId: string;
  quantity: number;
  rate: number;
  amount: number;
  reason: string;
  product: {
    sku: string;
    name: string;
  };
}

interface PurchaseReturn {
  id: string;
  returnDate: string | Date;
  reason: string | null;
  totalAmount: number;
  supplier: {
    name: string;
    gstin: string;
  };
  purchaseBill: {
    invoiceNumber: string;
  };
  items: PurchaseReturnItem[];
}

const RETURN_REASONS = [
  "Stitching Defect",
  "Fabric Damage",
  "Color Mismatch",
  "Size Mismatch",
  "Wrong Item",
  "Other"
];

export default function PurchaseReturnsPage() {
  const [returnsList, setReturnsList] = useState<PurchaseReturn[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [bills, setBills] = useState<PurchaseBill[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form States
  const [supplierId, setSupplierId] = useState("");
  const [purchaseBillId, setPurchaseBillId] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [generalReason, setGeneralReason] = useState("");
  const [returnItems, setReturnItems] = useState<ReturnItemInput[]>([]);
  
  // Dialog / Details States
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);

  // Submitting States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [returnsRes, suppliersRes, billsRes] = await Promise.all([
      getPurchaseReturns(),
      getSuppliers(),
      getPurchaseBills()
    ]);

    if (returnsRes.success && returnsRes.data) {
      setReturnsList(returnsRes.data as unknown as PurchaseReturn[]);
    }
    if (suppliersRes.success && suppliersRes.data) {
      setSuppliers(suppliersRes.data);
    }
    if (billsRes.success && billsRes.data) {
      setBills(billsRes.data as unknown as PurchaseBill[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter bills by selected supplier
  const filteredBills = useMemo(() => {
    if (!supplierId) return [];
    return bills.filter((b) => b.supplierId === supplierId);
  }, [bills, supplierId]);

  // Load items from selected purchase bill
  const handleBillChange = (billId: string) => {
    setPurchaseBillId(billId);
    if (!billId) {
      setReturnItems([]);
      return;
    }

    const selectedBill = bills.find((b) => b.id === billId);
    if (selectedBill) {
      // Find what was already returned for this bill
      const previousReturnsForBill = returnsList.filter(
        (ret) => ret.purchaseBill.invoiceNumber === selectedBill.invoiceNumber
      );

      const returnedCountMap = new Map<string, number>();
      previousReturnsForBill.forEach((ret) => {
        ret.items.forEach((item) => {
          returnedCountMap.set(
            item.productId,
            (returnedCountMap.get(item.productId) || 0) + item.quantity
          );
        });
      });

      const inputs: ReturnItemInput[] = selectedBill.items.map((item) => {
        const returnedQty = returnedCountMap.get(item.productId) || 0;
        const remainingQty = Math.max(0, item.quantity - returnedQty);

        return {
          productId: item.productId,
          sku: item.product.sku,
          name: item.product.name,
          purchasedQty: remainingQty, // store remaining instead of original
          rate: item.rate,
          returnQty: 0, // start with 0 to return
          reason: "Stitching Defect",
        };
      });

      setReturnItems(inputs);
    }
  };

  const handleReturnQtyChange = (index: number, val: string) => {
    const qty = parseInt(val) || 0;
    setReturnItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };
      row.returnQty = Math.min(row.purchasedQty, Math.max(0, qty)); // bound between 0 and remaining quantity
      updated[index] = row;
      return updated;
    });
  };

  const handleReturnReasonChange = (index: number, reason: ReturnItemInput["reason"]) => {
    setReturnItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], reason };
      return updated;
    });
  };

  const calculatedTotal = returnItems.reduce((sum, item) => sum + item.returnQty * item.rate, 0);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!supplierId || !purchaseBillId) {
      setError("Please select supplier and purchase bill.");
      setSubmitting(false);
      return;
    }

    const itemsToReturn = returnItems.filter((i) => i.returnQty > 0);

    if (itemsToReturn.length === 0) {
      setError("Please enter a return quantity greater than 0 for at least one item.");
      setSubmitting(false);
      return;
    }

    const payload = {
      supplierId,
      purchaseBillId,
      returnDate,
      reason: generalReason.trim(),
      items: itemsToReturn.map(({ productId, returnQty, rate, reason }) => ({
        productId,
        quantity: returnQty,
        rate,
        reason
      }))
    };

    const res = await createPurchaseReturn(payload);
    setSubmitting(false);

    if (res.success) {
      setSuccessMessage("Purchase Return filed successfully!");
      setIsCreating(false);
      resetForm();
      fetchData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setError(res.error || "Failed to submit return");
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setPurchaseBillId("");
    setReturnDate("");
    setGeneralReason("");
    setReturnItems([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Purchase Returns</h2>
          <p className="text-sm text-muted-foreground">
            Manage returns of defective or incorrect products to suppliers.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center justify-center bg-rose-600 hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            File Purchase Return
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
        /* Create Return Form */
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <h3 className="text-lg font-bold border-b border-border pb-3 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-rose-500" />
              Return Invoice Details
            </h3>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Supplier
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => {
                    setSupplierId(e.target.value);
                    handleBillChange(""); // clear invoice selection
                  }}
                  required
                  className="input-field"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Reference Invoice
                </label>
                <select
                  value={purchaseBillId}
                  onChange={(e) => handleBillChange(e.target.value)}
                  required
                  disabled={!supplierId}
                  className="input-field"
                >
                  <option value="">Select Invoice</option>
                  {filteredBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.invoiceNumber} - ({new Date(b.invoiceDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Return Date
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Remarks / General Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stitching defects on batch"
                  value={generalReason}
                  onChange={(e) => setGeneralReason(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Return items selection table */}
          {returnItems.length > 0 && (
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-bold border-b border-border pb-3">
                Select Items to Return
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                      <th className="py-2 pr-4 font-semibold w-1/4">Product (SKU)</th>
                      <th className="py-2 px-4 font-semibold w-1/12 text-right">Available Qty</th>
                      <th className="py-2 px-4 font-semibold w-[120px] text-right">Return Qty</th>
                      <th className="py-2 px-4 font-semibold w-1/6 text-right">Rate (₹)</th>
                      <th className="py-2 px-4 font-semibold w-1/4">Reason for Return</th>
                      <th className="py-2 pl-4 font-semibold text-right w-1/6">Refund Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {returnItems.map((item, index) => (
                      <tr key={index} className={item.returnQty > 0 ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.06]" : "hover:bg-muted/10"}>
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-foreground">{item.name}</div>
                          <span className="text-xs font-mono text-indigo-500">{item.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {item.purchasedQty}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            min={0}
                            max={item.purchasedQty}
                            disabled={item.purchasedQty === 0}
                            value={item.returnQty || ""}
                            onChange={(e) => handleReturnQtyChange(index, e.target.value)}
                            className="input-field text-xs text-right font-mono max-w-[100px] inline-block"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                          ₹{item.rate.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={item.reason}
                            onChange={(e) => handleReturnReasonChange(index, e.target.value as ReturnItemInput["reason"])}
                            disabled={item.returnQty === 0}
                            className="input-field text-xs disabled:opacity-40"
                          >
                            {RETURN_REASONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pl-4 text-right font-semibold font-mono">
                          ₹{(item.returnQty * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Card */}
              <div className="border-t border-border pt-6 flex justify-between items-center max-w-sm ml-auto">
                <span className="font-bold text-sm text-muted-foreground uppercase">Total Refund Amount</span>
                <span className="text-2xl font-bold font-mono text-rose-500">₹{calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary bg-rose-600 hover:bg-rose-700 min-w-[120px] flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Return...
                    </>
                  ) : (
                    "Save Return"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Purchase Returns List */
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Return Date</th>
                  <th className="px-6 py-4 font-semibold">Supplier</th>
                  <th className="px-6 py-4 font-semibold">Ref Invoice</th>
                  <th className="px-6 py-4 font-semibold">Reason / Remarks</th>
                  <th className="px-6 py-4 font-semibold text-right">Refund Total</th>
                  <th className="px-6 py-4 font-semibold text-center">Items Returned</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                        Loading returns list...
                      </div>
                    </td>
                  </tr>
                ) : returnsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No purchase returns recorded yet.
                    </td>
                  </tr>
                ) : (
                  returnsList.map((ret) => (
                    <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(ret.returnDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {ret.supplier.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground font-semibold">
                        #{ret.purchaseBill.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                        {ret.reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-rose-500">
                        ₹{ret.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-xs rounded-full font-semibold">
                          {ret.items.length} items
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedReturn(ret)}
                          className="btn-secondary text-xs flex items-center gap-1.5 ml-auto py-1.5 px-3"
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

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Purchase Return Details</h3>
                <p className="text-xs text-muted-foreground">Supplier: {selectedReturn.supplier.name}</p>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Return Date</span>
                  <span className="font-semibold">{new Date(selectedReturn.returnDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Ref Invoice Number</span>
                  <span className="font-semibold font-mono">#{selectedReturn.purchaseBill.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">General Reason</span>
                  <span className="font-semibold">{selectedReturn.reason || "-"}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted font-bold border-b border-border">
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-right">Return Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3">Defect/Reason</th>
                      <th className="p-3 text-right">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedReturn.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/10">
                        <td className="p-3 font-mono font-semibold text-indigo-500">{item.product.sku}</td>
                        <td className="p-3">{item.product.name}</td>
                        <td className="p-3 text-right font-semibold">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">₹{item.rate.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 font-semibold rounded text-[10px]">
                            {item.reason}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Card */}
              <div className="flex justify-end pt-4 border-t border-border">
                <div className="bg-rose-500/10 rounded-lg p-4 flex flex-col items-end border border-rose-500/20 w-[240px]">
                  <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Total Refunded</span>
                  <span className="text-2xl font-bold font-mono text-rose-500">₹{selectedReturn.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

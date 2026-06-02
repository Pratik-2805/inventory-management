"use client";

import { useEffect, useState, useCallback } from "react";
import { getStockMovements } from "@/actions/ledger";
import { getProducts } from "@/actions/products";
import { Calendar, Filter, Loader2, ArrowUpRight, ArrowDownLeft, RefreshCcw } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface StockMovement {
  id: string;
  productId: string;
  movementType: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  remarks: string | null;
  createdAt: string | Date;
  product: {
    sku: string;
    name: string;
  };
}

export default function StockLedgerPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filters State
  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const res = await getProducts({ limit: 100 });
    if (res.success && res.data) {
      setProducts(res.data);
    }
    setLoadingProducts(false);
  };

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    const res = await getStockMovements({
      productId: productId || undefined,
      movementType: movementType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    if (res.success && res.data) {
      setMovements(res.data as unknown as StockMovement[]);
    }
    setLoading(false);
  }, [productId, movementType, startDate, endDate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleResetFilters = () => {
    setProductId("");
    setMovementType("");
    setStartDate("");
    setEndDate("");
  };

  const getMovementBadgeStyles = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "CUSTOMER_RETURN":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "SALE":
      case "PURCHASE_RETURN":
      case "DAMAGE":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "ADJUSTMENT":
      default:
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Stock Ledger</h2>
        <p className="text-sm text-muted-foreground">
          Audit trail of all inventory stock movements and adjustments.
        </p>
      </div>

      {/* Filters Form */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <Filter className="h-4 w-4 text-indigo-500" />
          <span>Filter Ledger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={loadingProducts}
              className="input-field text-xs"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Movement Type</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="input-field text-xs"
            >
              <option value="">All Movements</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="PURCHASE_RETURN">PURCHASE_RETURN</option>
              <option value="SALE">SALE</option>
              <option value="CUSTOMER_RETURN">CUSTOMER_RETURN</option>
              <option value="DAMAGE">DAMAGE</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleResetFilters}
              className="btn-secondary text-xs flex-1 h-[38px] flex items-center justify-center gap-1.5"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Qty Change</th>
                <th className="px-6 py-4 font-semibold">Reference</th>
                <th className="px-6 py-4 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      Loading ledger entries...
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No stock movements found in ledger for current criteria.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive = m.movementType === "PURCHASE" || m.movementType === "CUSTOMER_RETURN" || (m.movementType === "ADJUSTMENT" && m.quantity > 0);
                  const displayQty = isPositive ? `+${Math.abs(m.quantity)}` : `-${Math.abs(m.quantity)}`;

                  return (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-indigo-600/10 text-indigo-500 text-xs font-mono font-bold rounded-md mr-2">
                          {m.product.sku}
                        </span>
                        <span className="font-semibold text-foreground">{m.product.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getMovementBadgeStyles(m.movementType)}`}>
                          {m.movementType}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                        <span className="inline-flex items-center gap-1">
                          {isPositive ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {displayQty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground font-mono">
                        {m.referenceType}: {m.referenceId.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate" title={m.remarks || ""}>
                        {m.remarks || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

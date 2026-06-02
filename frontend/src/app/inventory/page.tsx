"use client";

import { useEffect, useState, useMemo } from "react";
import { getInventoryValuationAction } from "@/actions/inventory";
import { Search, Download, AlertTriangle, Boxes, TrendingUp, Loader2, ArrowRight } from "lucide-react";

interface ValuationItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  latestRate: number;
  valuation: number;
}

export default function InventoryValuationPage() {
  const [items, setItems] = useState<ValuationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await getInventoryValuationAction();
    if (res.success && res.data) {
      setItems(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute unique brands and categories for dropdown filters
  const brands = useMemo(() => {
    const set = new Set(items.map((i) => i.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBrand = selectedBrand ? item.brand === selectedBrand : true;
      const matchCategory = selectedCategory ? item.category === selectedCategory : true;

      return matchSearch && matchBrand && matchCategory;
    });
  }, [items, searchQuery, selectedBrand, selectedCategory]);

  // Summary Metrics
  const totalStockUnits = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.currentStock, 0);
  }, [filteredItems]);

  const totalValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.valuation, 0);
  }, [filteredItems]);

  const lowStockCount = useMemo(() => {
    return filteredItems.filter((item) => item.currentStock <= 5).length;
  }, [filteredItems]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;

    // Define CSV headers and row extraction
    const headers = ["SKU", "Product Name", "Brand", "Category", "Current Stock", "Latest Purchase Rate (INR)", "Valuation (INR)"];
    const csvRows = [
      headers.join(","),
      ...filteredItems.map((item) =>
        [
          `"${item.sku.replace(/"/g, '""')}"`,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.brand.replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          item.currentStock,
          item.latestRate,
          item.valuation,
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_Valuation_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Valuation</h2>
          <p className="text-sm text-muted-foreground">
            Real-time stock quantities and current valuation based on latest purchase rates.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredItems.length === 0}
          className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-xl">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Stock Units</p>
            <h4 className="text-2xl font-extrabold font-mono mt-1">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                totalStockUnits.toLocaleString()
              )}
            </h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Inventory Value</p>
            <h4 className="text-2xl font-extrabold font-mono mt-1 text-emerald-500">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `₹${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Low Stock items</p>
            <h4 className="text-2xl font-extrabold font-mono mt-1 text-amber-500">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                lowStockCount
              )}
            </h4>
          </div>
        </div>
      </div>

      {/* Filter / Search bar */}
      <div className="glass-panel p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by SKU, name, brand, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 text-xs"
          />
        </div>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="input-field text-xs"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field text-xs"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Valuation Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Brand / Category</th>
                <th className="px-6 py-4 font-semibold text-right">Current Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Latest Purchase Rate</th>
                <th className="px-6 py-4 font-semibold text-right">Inventory Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      Calculating valuation...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products matching current search filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.currentStock <= 5;
                  const isOut = item.currentStock <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-600/10 text-indigo-500 text-xs font-mono font-bold rounded-md">
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-foreground block">{item.brand}</span>
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold font-mono ${isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-foreground"}`}>
                            {item.currentStock}
                          </span>
                          {isOut ? (
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Out of Stock</span>
                          ) : isLow ? (
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Low Stock</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                        ₹{item.latestRate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-500">
                        ₹{item.valuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

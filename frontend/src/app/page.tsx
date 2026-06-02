import { 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Import, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History 
} from "lucide-react";
import Link from "next/link";

// Set revalidate to 0 so dashboard stats are always calculated fresh on load
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DashboardData {
  totalProducts: number;
  totalSuppliers: number;
  currentInventoryValue: number;
  lowStockCount: number;
  recentMovements: Array<{
    id: string;
    productId: string;
    movementType: string;
    quantity: number;
    referenceType: string;
    referenceId: string;
    remarks: string | null;
    createdAt: string;
    product: {
      id: string;
      sku: string;
      name: string;
      brand: string;
      category: string;
      hsnCode: string;
      gstRate: number;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  recentBills: Array<{
    id: string;
    supplierId: string;
    deliveryPartnerId: string | null;
    trackingNumber: string | null;
    invoiceNumber: string;
    invoiceDate: string;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    transportCharges: number;
    grandTotal: number;
    createdAt: string;
    updatedAt: string;
    supplier: {
      id: string;
      name: string;
      gstin: string;
      phone: string;
      email: string;
      address: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const res = await fetch(`${API_URL}/dashboard`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error || "Failed to fetch dashboard data");
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return {
      totalProducts: 0,
      totalSuppliers: 0,
      currentInventoryValue: 0,
      lowStockCount: 0,
      recentMovements: [],
      recentBills: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const {
    totalProducts,
    totalSuppliers,
    currentInventoryValue,
    lowStockCount,
    recentMovements,
    recentBills,
  } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          IMS Dashboard
        </h2>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Universal Inventory Management & Stock-In system overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-xl flex items-center justify-between hover:translate-y-[-2px] transition-all duration-200">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Products</p>
            <h3 className="text-3xl font-extrabold font-mono">{totalProducts}</h3>
          </div>
          <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex items-center justify-between hover:translate-y-[-2px] transition-all duration-200">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Suppliers</p>
            <h3 className="text-3xl font-extrabold font-mono">{totalSuppliers}</h3>
          </div>
          <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex items-center justify-between hover:translate-y-[-2px] transition-all duration-200">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Inventory Value</p>
            <h3 className="text-3xl font-extrabold font-mono text-emerald-500">
              ₹{currentInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex items-center justify-between hover:translate-y-[-2px] transition-all duration-200">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Low Stock Items</p>
            <h3 className={`text-3xl font-extrabold font-mono ${lowStockCount > 0 ? "text-amber-500" : "text-foreground"}`}>
              {lowStockCount}
            </h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid for Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Purchases */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600/10 text-indigo-500 rounded-lg">
                <Import className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-base">Recent Stock-In Invoices</h4>
            </div>
            <Link href="/stock-in" className="text-xs font-semibold text-indigo-500 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-border text-sm">
            {recentBills.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">No purchase invoices recorded.</p>
            ) : (
              recentBills.map((bill) => (
                <div key={bill.id} className="py-3 flex justify-between items-center hover:bg-muted/10 px-2 rounded-lg transition-colors">
                  <div>
                    <span className="font-mono font-bold block text-foreground">Invoice #{bill.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground">{bill.supplier.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-500 block">₹{bill.grandTotal.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(bill.invoiceDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600/10 text-indigo-500 rounded-lg">
                <History className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-base">Recent Stock Ledger Movements</h4>
            </div>
            <Link href="/stock-ledger" className="text-xs font-semibold text-indigo-500 hover:underline">
              Audit Ledger
            </Link>
          </div>

          <div className="divide-y divide-border text-sm">
            {recentMovements.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">No ledger movements found.</p>
            ) : (
              recentMovements.map((m) => {
                const isPositive = m.movementType === "PURCHASE" || m.movementType === "CUSTOMER_RETURN";
                const displayQty = isPositive ? `+${Math.abs(m.quantity)}` : `-${Math.abs(m.quantity)}`;
                return (
                  <div key={m.id} className="py-3 flex justify-between items-center hover:bg-muted/10 px-2 rounded-lg transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-mono font-bold rounded">
                          {m.product.sku}
                        </span>
                        <span className="font-semibold">{m.product.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        Type: <strong className="text-foreground">{m.movementType}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                        {isPositive ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                        {displayQty}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Import,
  Boxes,
  ScrollText,
  RotateCcw,
  Store,
  Menu,
  X,
  Truck,
  UserCheck
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/delivery-partners", label: "Delivery Partners", icon: Truck },
  { href: "/customers", label: "Customers", icon: UserCheck },
  { href: "/stock-in", label: "Stock In", icon: Import },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/stock-ledger", label: "Stock Ledger", icon: ScrollText },
  { href: "/purchase-returns", label: "Purchase Returns", icon: RotateCcw },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card text-foreground border border-border shadow-md focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } bg-card/85 backdrop-blur-md border-r border-border flex flex-col justify-between`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-6 py-3 mb-6">
            <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-lg">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Universal IMS
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Inventory Management
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-500 border-l-4 border-indigo-500 pl-3"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-muted/40 text-center">
          <p className="text-xs text-muted-foreground font-semibold">
            IMS ERP v1.0.0
          </p>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}

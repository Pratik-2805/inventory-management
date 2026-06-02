'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Boxes,
  Building2,
  DollarSign,
  FileText,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Warehouse,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/custom-ui/button'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: BarChart3,
  },
  {
    title: 'Inventory',
    icon: Boxes,
    items: [
      { title: 'Overview', href: '/inventory' },
      { title: 'Products', href: '/products' },
      { title: 'Categories', href: '/categories' },
      { title: 'Stock Ledger', href: '/stock-ledger' },
    ],
  },
  {
    title: 'Procurement',
    icon: ShoppingCart,
    items: [
      { title: 'Purchases', href: '/purchases' },
      { title: 'Suppliers', href: '/suppliers' },
      { title: 'Delivery Partners', href: '/delivery-partners' },
      { title: 'Purchase Returns', href: '/purchase-returns' },
    ],
  },
  {
    title: 'Sales',
    icon: TrendingUp,
    items: [
      { title: 'Sales Invoices', href: '/sales' },
      { title: 'Customers', href: '/customers' },
      { title: 'Sales Returns', href: '/sales-returns' },
    ],
  },
  {
    title: 'Operations',
    icon: Package,
    items: [
      { title: 'Warehouses', href: '/warehouses' },
      { title: 'Stock Transfers', href: '/stock-transfers' },
      { title: 'Stock Adjustments', href: '/stock-adjustments' },
    ],
  },
  {
    title: 'Billing',
    icon: DollarSign,
    items: [
      { title: 'Invoices', href: '/billing' },
      { title: 'Payment Status', href: '/billing/payments' },
    ],
  },
  {
    title: 'Analytics',
    icon: FileText,
    items: [
      { title: 'Inventory Report', href: '/reports/inventory' },
      { title: 'Purchase Report', href: '/reports/purchases' },
      { title: 'Sales Report', href: '/reports/sales' },
      { title: 'Profit Report', href: '/reports/profit' },
      { title: 'GST Report', href: '/reports/gst' },
      { title: 'Stock Movement', href: '/reports/stock-movement' },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface NavItemProps {
  item: (typeof navigationItems)[0]
  isActive: boolean
  currentPathname: string
  isMobile?: boolean
}

function NavItem({ item, isActive, currentPathname, isMobile = false }: NavItemProps) {
  const [expanded, setExpanded] = useState(isActive)
  const Icon = item.icon

  useEffect(() => {
    if (isActive) {
      setExpanded(true)
    }
  }, [isActive])

  if (!item.items) {
    return (
      <Link
        href={item.href!}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{item.title}</span>
      </Link>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pl-4">
              {item.items.map((subItem) => {
                const isSubActive = currentPathname === subItem.href
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isSubActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    {subItem.title}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">Enterprise ERP</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavItem
            key={item.title}
            item={item}
            isActive={
              item.href
                ? pathname === item.href
                : item.items?.some((sub) => pathname === sub.href) ?? false
            }
            currentPathname={pathname}
            isMobile={false}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-background flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden border-b border-border px-4 py-3 flex items-center justify-between bg-background">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg">ERP</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed left-0 top-0 h-screen w-64 border-r border-border bg-background flex-col z-50 overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

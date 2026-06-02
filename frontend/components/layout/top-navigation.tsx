'use client'

import { Bell, Moon, Sun, LogOut, User, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/custom-ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/custom-ui/dialog'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/custom-ui/dropdown-menu'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const notifications = [
  {
    id: 1,
    title: 'Low Stock Alert',
    description: 'Product SKU-001 stock below reorder level',
    time: '5 minutes ago',
  },
  {
    id: 2,
    title: 'Purchase Received',
    description: 'PO-2024-001 received and verified',
    time: '2 hours ago',
  },
  {
    id: 3,
    title: 'Invoice Overdue',
    description: 'Invoice INV-2024-045 is now overdue',
    time: '1 day ago',
  },
  {
    id: 4,
    title: 'Stock Transfer Complete',
    description: 'Stock transferred from Main to Branch warehouse',
    time: '3 days ago',
  },
]

export function TopNavigation() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 gap-4">
        <div className="hidden sm:flex flex-col">
          <h2 className="text-sm font-semibold">Welcome to Enterprise ERP</h2>
          <p className="text-xs text-muted-foreground">Manage your inventory and billing efficiently</p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationOpen(true)}
              className="relative p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Bell className="w-5 h-5" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"
              />
            </motion.button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>You have {notifications.length} new notifications</DialogDescription>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-b border-border pb-4 last:border-b-0"
                  >
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </motion.div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <User className="w-5 h-5" />
            </motion.button>

            {userMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setUserMenuOpen(false)}
                  className="fixed inset-0"
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors border-t border-border"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors border-t border-border flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

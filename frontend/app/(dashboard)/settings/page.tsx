'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Input } from '@/components/custom-ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/custom-ui/tabs'
import { User, Building2, Bell, Lock, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configurations</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your profile and account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstname" className="block text-sm font-medium mb-2">First Name</label>
                  <Input id="firstname" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastname" className="block text-sm font-medium mb-2">Last Name</label>
                  <Input id="lastname" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                <Input id="phone" defaultValue="+1 (555) 000-0000" />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"/>
              <div className="space-y-4">
                <h3 className="font-semibold">Change Password</h3>
                <div className="space-y-2">
                  <label htmlFor="current-password" className="block text-sm font-medium mb-2">Current Password</label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-medium mb-2">New Password</label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">Confirm Password</label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>Configure your company information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="company-name" className="block text-sm font-medium mb-2">Company Name</label>
                <Input id="company-name" defaultValue="Enterprise Inc." />
              </div>
              <div className="space-y-2">
                <label htmlFor="company-email" className="block text-sm font-medium mb-2">Company Email</label>
                <Input id="company-email" type="email" defaultValue="contact@enterprise.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="industry" className="block text-sm font-medium mb-2">Industry Type</label>
                <select className="w-full border rounded-md p-2 text-sm">
                  <option>Manufacturing</option>
                  <option>Retail</option>
                  <option>Distribution</option>
                  <option>Wholesale</option>
                  <option>Electronics</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="tax-id" className="block text-sm font-medium mb-2">Tax ID / GST</label>
                  <Input id="tax-id" defaultValue="12ABCDE1234F1Z0" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="currency" className="block text-sm font-medium mb-2">Currency</label>
                  <select className="w-full border rounded-md p-2 text-sm">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>INR (₹)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>
              <Button>Save Company Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Inventory Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="low-stock" className="font-normal" className="block text-sm font-medium mb-2">Low Stock Alerts</label>
                    <input type="checkbox" id="low-stock" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="stock-out" className="font-normal" className="block text-sm font-medium mb-2">Out of Stock Notifications</label>
                    <input type="checkbox" id="stock-out" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="reorder" className="font-normal" className="block text-sm font-medium mb-2">Reorder Point Alerts</label>
                    <input type="checkbox" id="reorder" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4"/>

              <div className="space-y-4">
                <h3 className="font-semibold">Transaction Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="sale-notification" className="font-normal" className="block text-sm font-medium mb-2">Sale Notifications</label>
                    <input type="checkbox" id="sale-notification" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="purchase-notification" className="font-normal" className="block text-sm font-medium mb-2">Purchase Notifications</label>
                    <input type="checkbox" id="purchase-notification" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="payment-alert" className="font-normal" className="block text-sm font-medium mb-2">Payment Due Alerts</label>
                    <input type="checkbox" id="payment-alert" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4"/>

              <div className="space-y-4">
                <h3 className="font-semibold">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="daily-summary" className="font-normal" className="block text-sm font-medium mb-2">Daily Summary</label>
                    <input type="checkbox" id="daily-summary" className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="weekly-report" className="font-normal" className="block text-sm font-medium mb-2">Weekly Report</label>
                    <input type="checkbox" id="weekly-report" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                  </div>
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">API Settings</h3>
                <p className="text-sm text-muted-foreground">Generate and manage API keys for integrations</p>
                <Button variant="outline">Generate API Key</Button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4"/>

              <div className="space-y-4">
                <h3 className="font-semibold">Data & Privacy</h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Download or delete your data</p>
                  <div className="flex gap-2">
                    <Button variant="outline">Download Data</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4"/>

              <div className="space-y-4">
                <h3 className="font-semibold">Backup & Recovery</h3>
                <p className="text-sm text-muted-foreground">Last backup: 2024-01-20 at 14:30 UTC</p>
                <Button variant="outline">Create Backup Now</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

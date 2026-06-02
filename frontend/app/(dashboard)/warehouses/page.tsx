'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import { Badge } from '@/components/custom-ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/custom-ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/custom-ui/dialog'
import { Plus, Building2 } from 'lucide-react'
import { Input } from '@/components/custom-ui/input'

const warehouses = [
  {
    id: 1,
    name: 'Main Warehouse',
    location: 'New York, USA',
    inventoryValue: 250000,
    capacity: 500000,
    activeProducts: 45,
    stock: 15000,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Branch Warehouse',
    location: 'Los Angeles, USA',
    inventoryValue: 125000,
    capacity: 300000,
    activeProducts: 32,
    stock: 8500,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Distribution Center',
    location: 'Chicago, USA',
    inventoryValue: 185000,
    capacity: 400000,
    activeProducts: 52,
    stock: 12000,
    status: 'Active',
  },
]

const warehouseProducts = [
  { warehouse: 'Main Warehouse', sku: 'SKU-001', product: 'Cotton T-Shirt', quantity: 250 },
  { warehouse: 'Main Warehouse', sku: 'SKU-004', product: 'LED Desk Lamp', quantity: 175 },
  { warehouse: 'Main Warehouse', sku: 'SKU-005', product: 'Office Chair', quantity: 32 },
  { warehouse: 'Branch', sku: 'SKU-002', product: 'Denim Jeans', quantity: 45 },
  { warehouse: 'Branch', sku: 'SKU-006', product: 'Stainless Steel Pan', quantity: 95 },
  { warehouse: 'Distribution Center', sku: 'SKU-001', product: 'Cotton T-Shirt', quantity: 120 },
  { warehouse: 'Distribution Center', sku: 'SKU-003', product: 'Wireless Headphones', quantity: 0 },
]

export default function WarehousesPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
        <p className="text-muted-foreground">Monitor inventory across multiple warehouses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {warehouses.map((warehouse) => {
          const capacityPercent = (warehouse.stock / warehouse.capacity) * 100

          return (
            <Card key={warehouse.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {warehouse.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{warehouse.location}</CardDescription>
                  </div>
                  <Badge variant="default">{warehouse.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Capacity Used</span>
                    <span className="font-semibold">{capacityPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${Math.min(capacityPercent, 100)}%`}}/></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Inventory Value</p>
                    <p className="font-semibold mt-1">${(warehouse.inventoryValue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="font-semibold mt-1">{warehouse.activeProducts}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        Transfer Stock
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Transfer Stock</DialogTitle>
                        <DialogDescription>Move inventory between warehouses</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="from-warehouse" className="block text-sm font-medium mb-2">From Warehouse</label>
                          <Input id="from-warehouse" defaultValue={warehouse.name} disabled />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="to-warehouse" className="block text-sm font-medium mb-2">To Warehouse</label>
                          <select className="w-full border rounded-md p-2 text-sm">
                            <option>Select warehouse</option>
                            {warehouses
                              .filter((w) => w.id !== warehouse.id)
                              .map((w) => (
                                <option key={w.id} value={w.name}>
                                  {w.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="quantity" className="block text-sm font-medium mb-2">Quantity</label>
                          <Input id="quantity" type="number" placeholder="0" />
                        </div>
                        <Button className="w-full">Complete Transfer</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Distribution by Warehouse</CardTitle>
          <CardDescription>Product availability across locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Warehouse</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseProducts.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.warehouse}</TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.quantity === 0 ? 'text-red-600 font-semibold' : 'font-semibold'}>
                        {item.quantity}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

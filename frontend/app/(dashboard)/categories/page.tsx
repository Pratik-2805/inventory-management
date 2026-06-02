'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/custom-ui/card'
import { Button } from '@/components/custom-ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/custom-ui/table'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/custom-ui/badge'

const categories = [
  { id: 1, name: 'Apparel', products: 45, activeStatus: 'Active' },
  { id: 2, name: 'Electronics', products: 32, activeStatus: 'Active' },
  { id: 3, name: 'Furniture', products: 18, activeStatus: 'Active' },
  { id: 4, name: 'Kitchenware', products: 12, activeStatus: 'Active' },
  { id: 5, name: 'Medical', products: 8, activeStatus: 'Inactive' },
  { id: 6, name: 'Hardware', products: 25, activeStatus: 'Active' },
]

export default function CategoriesPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">Manage product categories and their organization</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>List of all product categories ({categories.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Category Name</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-right font-semibold">{cat.products}</TableCell>
                    <TableCell>
                      <Badge variant={cat.activeStatus === 'Active' ? 'default' : 'secondary'}>
                        {cat.activeStatus}
                      </Badge>
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

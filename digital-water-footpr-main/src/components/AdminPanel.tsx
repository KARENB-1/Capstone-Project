import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { WaterCoefficient } from '@/lib/types'
import { generateId } from '@/lib/auth'
import { Plus, Pencil, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function AdminPanel() {
  const [coefficients, setCoefficients] = useKV<WaterCoefficient[]>('waterCoefficients', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCoefficient, setEditingCoefficient] = useState<WaterCoefficient | null>(null)

  const [form, setForm] = useState({
    productName: '',
    category: '',
    unit: 'kg',
    baseLiters: ''
  })

  const resetForm = () => {
    setForm({ productName: '', category: '', unit: 'kg', baseLiters: '' })
    setEditingCoefficient(null)
  }

  const handleAdd = () => {
    if (!form.productName || !form.category || !form.baseLiters) {
      toast.error('Please fill in all fields')
      return
    }

    const newCoefficient: WaterCoefficient = {
      id: generateId(),
      productName: form.productName,
      category: form.category,
      unit: form.unit,
      baseLiters: parseFloat(form.baseLiters)
    }

    setCoefficients((prev) => [...(prev || []), newCoefficient])
    toast.success('Coefficient added successfully')
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (coefficient: WaterCoefficient) => {
    setEditingCoefficient(coefficient)
    setForm({
      productName: coefficient.productName,
      category: coefficient.category,
      unit: coefficient.unit,
      baseLiters: coefficient.baseLiters.toString()
    })
  }

  const handleUpdate = () => {
    if (!editingCoefficient) return

    if (!form.productName || !form.category || !form.baseLiters) {
      toast.error('Please fill in all fields')
      return
    }

    setCoefficients((prev) =>
      (prev || []).map(c =>
        c.id === editingCoefficient.id
          ? {
              ...c,
              productName: form.productName,
              category: form.category,
              unit: form.unit,
              baseLiters: parseFloat(form.baseLiters)
            }
          : c
      )
    )

    toast.success('Coefficient updated successfully')
    resetForm()
  }

  const handleDelete = (id: string) => {
    setCoefficients((prev) => (prev || []).filter(c => c.id !== id))
    toast.success('Coefficient deleted')
  }

  const sortedCoefficients = [...(coefficients || [])].sort((a, b) =>
    a.productName.localeCompare(b.productName)
  )

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Water Coefficients Database</CardTitle>
              <CardDescription>Manage reference values for water footprint calculations</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={20} className="mr-2" />
                  Add Coefficient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Water Coefficient</DialogTitle>
                  <DialogDescription>Enter the water footprint data for a new product</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={form.productName}
                      onChange={(e) => setForm({ ...form, productName: e.target.value })}
                      placeholder="e.g., Tomato"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., Vegetable"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      placeholder="e.g., kg"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="base-liters">Base Liters</Label>
                    <Input
                      id="base-liters"
                      type="number"
                      value={form.baseLiters}
                      onChange={(e) => setForm({ ...form, baseLiters: e.target.value })}
                      placeholder="e.g., 214"
                    />
                  </div>
                  <Button onClick={handleAdd} className="w-full">
                    Add Coefficient
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedCoefficients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No coefficients yet. Add your first water footprint reference value.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Base Liters</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCoefficients.map((coefficient) => (
                  <TableRow key={coefficient.id}>
                    <TableCell className="font-medium">{coefficient.productName}</TableCell>
                    <TableCell>{coefficient.category}</TableCell>
                    <TableCell>{coefficient.unit}</TableCell>
                    <TableCell className="text-right">{coefficient.baseLiters.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(coefficient)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(coefficient.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingCoefficient && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Coefficient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-product-name">Product Name</Label>
                <Input
                  id="edit-product-name"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-base-liters">Base Liters</Label>
                <Input
                  id="edit-base-liters"
                  type="number"
                  value={form.baseLiters}
                  onChange={(e) => setForm({ ...form, baseLiters: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1">
                  Update Coefficient
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

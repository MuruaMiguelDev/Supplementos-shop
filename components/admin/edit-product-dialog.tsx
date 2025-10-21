"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Product {
  id: string
  slug: string
  name: string
  brand: string | null
  description: string | null
  price: number
  compare_at_price: number | null
  stock: number
  categories: string[] | null
  tags: string[] | null
  flavors: string[] | null
  images: string[] | null
}

interface EditProductDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated: (product: Product) => void
}

export function EditProductDialog({ product, open, onOpenChange, onProductUpdated }: EditProductDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    brand: product.brand || "",
    description: product.description || "",
    price: product.price.toString(),
    compareAtPrice: product.compare_at_price?.toString() || "",
    stock: product.stock.toString(),
    categories: product.categories?.join(", ") || "",
    tags: product.tags?.join(", ") || "",
    flavors: product.flavors?.join(", ") || "",
    images: product.images?.join(", ") || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          brand: formData.brand || null,
          description: formData.description || null,
          price: Number.parseFloat(formData.price),
          compare_at_price: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : null,
          stock: Number.parseInt(formData.stock),
          categories: formData.categories ? formData.categories.split(",").map((c) => c.trim()) : [],
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
          flavors: formData.flavors ? formData.flavors.split(",").map((f) => f.trim()) : [],
          images: formData.images ? formData.images.split(",").map((i) => i.trim()) : [],
        }),
      })

      if (!response.ok) throw new Error("Error al actualizar producto")

      const updatedProduct = await response.json()
      onProductUpdated(updatedProduct)
      toast({ title: "Producto actualizado exitosamente" })
    } catch (error) {
      toast({ title: "Error al actualizar producto", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Modifica los datos del producto</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categories">Categorías (separadas por coma)</Label>
              <Input
                id="categories"
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Precio Anterior</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separados por coma)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flavors">Sabores (separados por coma)</Label>
            <Input
              id="flavors"
              value={formData.flavors}
              onChange={(e) => setFormData({ ...formData, flavors: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">URLs de Imágenes (separadas por coma)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
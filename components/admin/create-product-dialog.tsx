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

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated: (product: any) => void
}

export function CreateProductDialog({ open, onOpenChange, onProductCreated }: CreateProductDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    brand: "",
    description: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    categories: "",
    tags: "",
    flavors: "",
    images: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
          brand: formData.brand || null,
          description: formData.description || null,
          price: Number.parseFloat(formData.price),
          compare_at_price: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : null,
          stock: Number.parseInt(formData.stock) || 0,
          categories: formData.categories ? formData.categories.split(",").map((c) => c.trim()) : [],
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
          flavors: formData.flavors ? formData.flavors.split(",").map((f) => f.trim()) : [],
          images: formData.images ? formData.images.split(",").map((i) => i.trim()) : [],
        }),
      })

      if (!response.ok) throw new Error("Error al crear producto")

      const newProduct = await response.json()
      onProductCreated(newProduct)
      toast({ title: "Producto creado exitosamente" })
      setFormData({
        name: "",
        slug: "",
        brand: "",
        description: "",
        price: "",
        compareAtPrice: "",
        stock: "",
        categories: "",
        tags: "",
        flavors: "",
        images: "",
      })
    } catch (error) {
      toast({ title: "Error al crear producto", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
          <DialogDescription>Completa los datos del nuevo producto</DialogDescription>
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
                placeholder="auto-generado si vacío"
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
                placeholder="Proteínas, Creatina"
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
              placeholder="proteína, músculo, recuperación"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flavors">Sabores (separados por coma)</Label>
            <Input
              id="flavors"
              value={formData.flavors}
              onChange={(e) => setFormData({ ...formData, flavors: e.target.value })}
              placeholder="Chocolate, Vainilla, Fresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">URLs de Imágenes (separadas por coma)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="/image1.jpg, /image2.jpg"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
}

interface DeleteProductDialogProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductDeleted: (productId: string) => void
}

export function DeleteProductDialog({ product, open, onOpenChange, onProductDeleted }: DeleteProductDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar producto")

      onProductDeleted(product.id)
      toast({ title: "Producto eliminado exitosamente" })
    } catch (error) {
      toast({ title: "Error al eliminar producto", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el producto{" "}
            <span className="font-semibold">{product.name}</span> de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
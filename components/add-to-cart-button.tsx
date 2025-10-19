"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/src/lib/store/cart"
import type { Product } from "@/types/product"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsAdding(true)

    try {
      addItem(product, quantity)

      toast({
        title: "Producto añadido",
        description: `${product.name} se ha añadido al carrito`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el producto al carrito",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsAdding(false), 500)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || !product.inStock}
      variant={variant}
      size={size}
      className={className}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? "Añadiendo..." : !product.inStock ? "Agotado" : "Añadir al carrito"}
    </Button>
  )
}

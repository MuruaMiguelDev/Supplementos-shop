"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface FavoriteButtonProps {
  productId?: string
  productSlug: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function FavoriteButton({
  productId,
  productSlug,
  variant = "outline",
  size = "icon",
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkFavoriteStatus()
  }, [productSlug])

  const checkFavoriteStatus = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        return
      }

      setIsAuthenticated(true)

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_slug", productSlug)
        .maybeSingle()

      if (!error && data) {
        setIsFavorite(true)
      } else {
        setIsFavorite(false)
      }
    } catch (error) {
      // Not a favorite or not authenticated
      setIsFavorite(false)
    }
  }

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      })
      router.push("/auth/login?redirect=/productos")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("No autenticado")

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_slug", productSlug)

        if (error) throw error

        setIsFavorite(false)
        toast({
          title: "Eliminado de favoritos",
          description: "El producto ha sido eliminado de tus favoritos",
        })
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          product_slug: productSlug,
        })

        if (error) throw error

        setIsFavorite(true)
        toast({
          title: "Añadido a favoritos",
          description: "El producto ha sido añadido a tus favoritos",
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar favoritos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleToggle} variant={variant} size={size} className={cn(className)} disabled={isLoading}>
      <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
    </Button>
  )
}

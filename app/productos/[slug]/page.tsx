"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation" // ✅ usar hooks de navegación en cliente
import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/src/lib/utils/currency"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FavoriteButton } from "@/components/favorite-button"
import { Star, Truck, Shield, ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/src/lib/store/cart"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/product"

export default function ProductDetailPage() {
  // ✅ Tomar el slug desde los params del App Router (cliente)
  const { slug } = useParams() as { slug: string }
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  useEffect(() => {
    if (!slug) return

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            // ❗ notFound() es de servidor; en cliente redirigimos:
            router.replace("/404")
            return
          }
          throw new Error("Failed to fetch product")
        }
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error("[v0] Error fetching product:", error)
        router.replace("/404")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [slug, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Cargando...</p>
      </div>
    )
  }

  // Si hubo redirección a /404, este return casi no se verá;
  // si por alguna razón no redirige, mostramos un fallback.
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Producto no encontrado.</p>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/productos">Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      addItem(product, quantity)
      toast({
        title: "Producto añadido",
        description: `${quantity}x ${product.name} añadido al carrito`,
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
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/productos">
          <ArrowLeft className="size-4 mr-2" />
          Volver a productos
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            <Image
              src={product.images?.[0] || (product as any).image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.compareAtPrice && (
              <Badge className="absolute top-4 right-4" variant="destructive">
                {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
              </Badge>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${idx + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.brand && <p className="text-sm text-muted-foreground uppercase tracking-wide">{product.brand}</p>}
          <h1 className="text-4xl font-bold">{product.name}</h1>

          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${
                      i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewsCount} reseñas)
              </span>
            </div>
          )}

          <p className="text-lg text-muted-foreground">{product.description}</p>

          <div className="flex items-baseline gap-3">
            <p className="text-4xl font-bold">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xl text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Cantidad:</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleDecrement} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={handleIncrement} disabled={quantity >= product.stock}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">({product.stock} disponibles)</span>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddToCart} disabled={isAdding || !product.inStock} className="flex-1" size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAdding ? "Añadiendo..." : !product.inStock ? "Agotado" : "Añadir al carrito"}
              </Button>
              <FavoriteButton productId={product.id} productSlug={product.slug} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="size-6 text-primary" />
              <p className="text-sm font-medium">Envío Gratis</p>
              <p className="text-xs text-muted-foreground">En pedidos +$50</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Shield className="size-6 text-primary" />
              <p className="text-sm font-medium">Garantía</p>
              <p className="text-xs text-muted-foreground">100% Original</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Star className="size-6 text-primary" />
              <p className="text-sm font-medium">Calidad</p>
              <p className="text-xs text-muted-foreground">Certificada</p>
            </div>
          </div>

          <Tabs defaultValue="info" className="pt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="uso">Modo de Uso</TabsTrigger>
              <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <dl className="space-y-2">
                    {product.meta &&
                      Object.entries(product.meta).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <dt className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</dt>
                          <dd className="font-medium">{String(value)}</dd>
                        </div>
                      ))}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Stock:</dt>
                      <dd className="font-medium">{product.stock > 0 ? "Disponible" : "Agotado"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="uso">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Tomar 1 porción (según indicaciones del producto) mezclada con agua o tu bebida favorita. Consumir
                    según las recomendaciones del fabricante.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ingredientes">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Consulta la etiqueta del producto para información detallada sobre ingredientes y valores
                    nutricionales.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
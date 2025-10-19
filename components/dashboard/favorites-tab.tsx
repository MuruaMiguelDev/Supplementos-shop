import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { RemoveFavoriteButton } from "@/components/remove-favorite-button"

interface FavoritesTabProps {
  userId: string
}

export async function FavoritesTab({ userId }: FavoritesTabProps) {
  const supabase = await createClient()

  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Fetch product details for each favorite
  const { listProducts } = await import("@/src/lib/api/products")
  const productsData = await listProducts(1, 100, {})
  const allProducts = productsData.products // Extract products array from paginated response
  const favoriteProducts = favorites?.map((fav) => allProducts.find((p) => p.slug === fav.product_slug)).filter(Boolean)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle>Mis Favoritos</CardTitle>
            <CardDescription>Productos que has guardado</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!favoriteProducts || favoriteProducts.length === 0 ? (
          <div className="py-12 text-center">
            <Heart className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No tienes productos favoritos aún</p>
            <Link href="/productos" className="mt-2 inline-block text-sm text-primary hover:underline">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteProducts.map((product: any) => (
              <Card key={product.slug} className="overflow-hidden">
                <Link href={`/productos/${product.slug}`}>
                  <div className="relative aspect-square">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                    {product.discount > 0 && (
                      <Badge className="absolute right-2 top-2 bg-red-500">-{product.discount}%</Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/productos/${product.slug}`}>
                    <h3 className="font-semibold hover:text-primary">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">${product.price}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">${product.price}</span>
                      )}
                    </div>
                  </Link>
                  <RemoveFavoriteButton productSlug={product.slug} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

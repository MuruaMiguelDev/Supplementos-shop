import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { RemoveFavoriteButton } from "@/components/remove-favorite-button"
import { formatCurrency } from "@/src/lib/utils/currency"
import { Heart } from "lucide-react"

export default async function FavoritesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/favoritos")
  }

  // Fetch user's favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch product details for each favorite
  const { listProducts } = await import("@/src/lib/api/products")
  const productsData = await listProducts(1, 100, {})
  const allProducts = productsData.products // Extract products array from paginated response
  const favoriteProducts = favorites?.map((fav) => allProducts.find((p) => p.slug === fav.product_slug)).filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="size-8 fill-primary text-primary" />
          Mis Favoritos
        </h1>
        <p className="text-muted-foreground">Productos que te gustan</p>
      </div>

      {!favoriteProducts || favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No tienes favoritos aún</h2>
          <p className="text-muted-foreground mb-6">Explora nuestros productos y añade tus favoritos</p>
          <Button asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product: any) => (
            <Card key={product.id} className="group overflow-hidden flex flex-col">
              <CardHeader className="p-0 relative">
                <Link href={`/productos/${product.slug}`}>
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                {product.discount && product.discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-primary">-{product.discount}%</Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <Link href={`/productos/${product.slug}`}>
                  <CardTitle className="text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </CardTitle>
                </Link>
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <div className="flex items-baseline gap-2">
                  {product.discount && product.discount > 0 ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(product.price * (1 - product.discount / 100))}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex-col gap-2">
                <AddToCartButton product={product} className="w-full" />
                <RemoveFavoriteButton productSlug={product.slug} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

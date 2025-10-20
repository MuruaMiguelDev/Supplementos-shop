
import 'server-only'
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { getServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RemoveFavoriteButton } from "@/components/remove-favorite-button"
import { formatCurrency } from "@/src/lib/utils/currency"

interface FavoritesTabProps {
  userId: string
}

export async function FavoritesTab({ userId }: FavoritesTabProps) {
  const supabase = await getServerSupabase()   // ✅ usar el helper correcto

  // 1) Traer slugs favoritos del usuario
  const { data: favRows, error: favErr } = await supabase
    .from("favorites")
    .select("product_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (favErr || !favRows?.length) {
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
          <div className="py-12 text-center">
            <Heart className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No tienes productos favoritos aún</p>
            <Link href="/productos" className="mt-2 inline-block text-sm text-primary hover:underline">
              Explorar productos
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const slugs = favRows.map(f => f.product_slug).filter(Boolean)

  // 2) Traer productos por slug (evitamos cargar 100 items)
  const { data } = await supabase.from("products").select("*").in("slug", slugs)
  const products = (data ?? []) as any[] // ✅ TS deja de quejarse

  const favoriteProducts = products.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    image: p.image,
    category: p.category,
    price: Number(p.price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
    discount: p.compare_at_price
      ? Math.round(((Number(p.compare_at_price) - Number(p.price)) / Number(p.compare_at_price)) * 100)
      : 0,
  }))

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteProducts.map((product) => (
            <Card key={product.slug} className="overflow-hidden">
              <Link href={`/productos/${product.slug}`}>
                <div className="relative aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.discount > 0 && (
                    <Badge className="absolute right-2 top-2 bg-red-500">-{product.discount}%</Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <Link href={`/productos/${product.slug}`}>
                  <h3 className="font-semibold hover:text-primary">{product.name}</h3>
                  {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.compareAtPrice ?? product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                    )}
                  </div>
                </Link>

                <RemoveFavoriteButton productSlug={product.slug} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
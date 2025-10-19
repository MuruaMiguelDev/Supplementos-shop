"use client"

import Link from "next/link"
import Image from "next/image"
import type { PaginatedProducts } from "@/types/product"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { FavoriteButton } from "@/components/favorite-button"
import { formatCurrency } from "@/src/lib/utils/currency"

interface ProductGridProps {
  productsData: PaginatedProducts
}

export function ProductGrid({ productsData }: ProductGridProps) {
  const products = productsData?.products || []

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">No se encontraron productos</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
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
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton productId={product.id} productSlug={product.slug} />
            </div>
            {product.discount && product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-primary">-{product.discount}%</Badge>
            )}
            {!product.inStock && <Badge className="absolute top-2 left-2 bg-destructive">Agotado</Badge>}
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
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
            )}
            <div className="flex items-baseline gap-2">
              {product.discount && product.discount > 0 ? (
                <>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(product.price * (1 - product.discount / 100))}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                </>
              ) : (
                <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <AddToCartButton product={product} className="w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

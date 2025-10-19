"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProductGrid } from "@/components/product-grid"
import { listProducts } from "@/src/lib/api/products"
import type { Product } from "@/types/product"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const searchProducts = async () => {
      setIsLoading(true)
      try {
        const { products: allProducts } = await listProducts(1, 100)

        if (searchQuery.trim()) {
          const filtered = allProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
          )
          setProducts(filtered)
        } else {
          setProducts(allProducts)
        }
      } catch (error) {
        console.error("Error searching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    searchProducts()
  }, [searchQuery])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-6 text-center">Buscar Productos</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar suplementos, proteínas, vitaminas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
            autoFocus
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Buscando productos...</p>
        </div>
      ) : (
        <>
          {searchQuery && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? "resultado" : "resultados"} para "{searchQuery}"
              </p>
            </div>
          )}

          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : searchQuery ? (
            <div className="text-center py-12">
              <p className="text-xl font-semibold mb-2">No se encontraron productos</p>
              <p className="text-muted-foreground">Intenta con otros términos de búsqueda</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

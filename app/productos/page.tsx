"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters, type FilterState } from "@/components/product-filters"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { PaginatedProducts } from "@/types/product"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""

  const [productsData, setProductsData] = useState<PaginatedProducts | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 200],
    inStock: false,
    onSale: false,
    hasTouchedPrice: false,   // 🔑
  })
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        })

        if (searchQuery) params.append("search", searchQuery)
        if (filters.categories.length > 0) params.append("categories", filters.categories.join(","))

        // 🔑 Solo enviar precio si el usuario tocó el slider
        if (filters.hasTouchedPrice) {
          const [min, max] = filters.priceRange || [0, 200]
          params.append("minPrice", String(min))
          params.append("maxPrice", String(max))
        }

        if (filters.inStock) params.append("inStock", "true")
        if (filters.onSale) params.append("onSale", "true")

        const response = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" })
        if (!response.ok) throw new Error("Failed to fetch products")

        const data = await response.json()

        const transformedData: PaginatedProducts = {
          products: (data.products || []).map((p: any) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            brand: p.brand,
            description: p.description,
            price: Number(p.price),
            compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
            image: p.image,
            images: p.image ? [p.image] : [],
            category: p.category,
            tags: p.tags || [],
            rating: p.rating != null ? Number(p.rating) : undefined,
            reviewsCount: p.reviews_count || 0,
            stock: p.stock || 0,
            discount: p.compare_at_price
              ? Math.round(((Number(p.compare_at_price) - Number(p.price)) / Number(p.compare_at_price)) * 100)
              : 0,
            inStock: (p.stock || 0) > 0,
          })),
          total: Number(data.total ?? 0),
          page: Number(data.page ?? 1),
          pageSize: Number(data.limit ?? 12),
          totalPages: Number(data.totalPages ?? Math.ceil((Number(data.total ?? 0)) / Number(data.limit ?? 12))),
        }

        setProductsData(transformedData)
      } catch (error) {
        console.error("[v0] Error fetching products:", error)
        setProductsData({ products: [], total: 0, page: 1, pageSize: 12, totalPages: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [page, filters, searchQuery])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Productos</h1>
        <p className="text-muted-foreground">Descubre nuestra selección de suplementos deportivos</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block space-y-6">
          <ProductFilters onFilterChange={handleFilterChange} />
        </aside>

        <main>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          ) : productsData ? (
            <>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  {productsData.total} resultado{productsData.total !== 1 ? "s" : ""} para "{searchQuery}"
                </p>
              )}
              <ProductGrid productsData={productsData} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se pudieron cargar los productos</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
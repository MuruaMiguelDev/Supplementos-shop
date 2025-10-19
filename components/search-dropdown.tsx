"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/src/lib/utils/currency"
import type { Product } from "@/types/product"
import { cn } from "@/lib/utils"

export function SearchDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([])
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "5",
          search: searchQuery,
        })
        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()

        // ✅ Normalizar resultados para que siempre exista `images[0]`
        const normalized: Product[] = (data.products || []).map((p: any) => {
          const images = p.images ?? (p.image ? [p.image] : [])
          const priceNum = Number(p.price)
          const compareNum = p.compare_at_price != null ? Number(p.compare_at_price) : undefined
          const discount =
            compareNum && compareNum > 0 ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0

        return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            brand: p.brand,
            description: p.description,
            price: priceNum,
            compareAtPrice: compareNum,
            image: p.image,
            images,
            category: p.category,
            tags: p.tags || [],
            rating: p.rating != null ? Number(p.rating) : undefined,
            reviewsCount: p.reviews_count || 0,
            stock: p.stock || 0,
            discount,
            inStock: (p.stock || 0) > 0,
          } as Product
        })

        setResults(normalized)
        setSelectedIndex(-1)
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          console.error("[v0] Error searching products:", error)
        }
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    setIsOpen(true)
  }

  const handleClear = () => {
    setSearchQuery("")
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results.length > 0) {
        const target = selectedIndex >= 0 ? results[selectedIndex] : results[0]
        if (target) {
          router.push(`/productos/${target.slug}`)
          setIsOpen(false)
          handleClear()
        }
      } else if (searchQuery.trim().length >= 2) {
        router.push(`/productos?search=${encodeURIComponent(searchQuery)}`)
        setIsOpen(false)
        handleClear()
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleProductClick = (slug: string) => {
    router.push(`/productos/${slug}`)
    setIsOpen(false)
    handleClear()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="hidden sm:flex">
        <Search className="size-5" />
        <span className="sr-only">Buscar</span>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-[400px] max-w-[calc(100vw-2rem)] max-h-[500px] overflow-hidden shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {results.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Usa ↑↓ para navegar, Enter para seleccionar</p>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className={cn(
                      "flex gap-3 p-3 hover:bg-accent transition-colors w-full text-left",
                      selectedIndex === index && "bg-accent",
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={product.images?.[0] ?? product.image ?? "/placeholder.svg"}
                        alt={product.name ?? "Producto"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{product.brand}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-sm">{formatCurrency(product.price)}</span>
                        {product.discount && product.discount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    router.push(`/productos?search=${encodeURIComponent(searchQuery)}`)
                    setIsOpen(false)
                    handleClear()
                  }}
                  className="block w-full p-3 text-center text-sm text-primary hover:bg-accent transition-colors font-medium"
                >
                  Ver todos los resultados
                </button>
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No se encontraron productos</p>
                <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    router.push(`/productos?search=${encodeURIComponent(searchQuery)}`)
                    setIsOpen(false)
                    handleClear()
                  }}
                >
                  Buscar de todas formas
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
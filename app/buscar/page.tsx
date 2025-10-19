'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductGrid } from '@/components/product-grid'
import type { Product } from '@/types/product'

export default function BuscarPage() {
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [products, setProducts] = useState<Product[]>([])
  const [page] = useState<number>(1)
  const [limit] = useState<number>(24)
  const abortRef = useRef<AbortController | null>(null)

  // Pequeño debounce manual
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    // Si no hay query, limpiamos resultados
    if (!debouncedQuery) {
      setProducts([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const run = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: debouncedQuery,
        })
        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to fetch products')
        const json = await res.json()
        setProducts(json?.products ?? [])
      } catch (e) {
        if ((e as any)?.name !== 'AbortError') {
          console.error('BuscarPage fetch error:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [debouncedQuery, page, limit])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos por nombre, categoría, etc."
          aria-label="Buscar productos"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Buscando productos…</p>
      ) : products.length === 0 && query ? (
        <p className="text-muted-foreground">No se encontraron resultados para “{query}”.</p>
      ) : (
        <ProductGrid productsData={{ products, page, limit, total: products.length }} />
      )}
    </div>
  )
}

/** Hook de debounce simple */
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
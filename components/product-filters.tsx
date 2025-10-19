"use client"

import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider" // si usas otro, adapta import
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export type FilterState = {
  categories: string[]
  priceRange: [number, number]
  inStock: boolean
  onSale: boolean
  hasTouchedPrice?: boolean
}

type Props = {
  onFilterChange: (filters: FilterState) => void
  initial?: Partial<FilterState>
}

// Ajusta tus categorías según tus datos
const CATEGORIES = ["Proteínas", "Creatina", "Pre-Entreno", "Aminoácidos", "Vitaminas", "Quemadores"]

export function ProductFilters({ onFilterChange, initial }: Props) {
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? [])
  const [priceRange, setPriceRange] = useState<[number, number]>(initial?.priceRange ?? [0, 1000])
  const [inStock, setInStock] = useState<boolean>(initial?.inStock ?? false)
  const [onSale, setOnSale] = useState<boolean>(initial?.onSale ?? false)
  const [hasTouchedPrice, setHasTouchedPrice] = useState<boolean>(initial?.hasTouchedPrice ?? false)

  // Emitimos cambios “no precio” de inmediato
  useEffect(() => {
    onFilterChange({ categories, priceRange, inStock, onSale, hasTouchedPrice })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, inStock, onSale])

  // Handlers
  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handlePriceChange = (val: number[]) => {
    // Mientras se arrastra, solo actualizamos UI local
    setPriceRange([val[0] ?? 0, val[1] ?? 0] as [number, number])
  }

  const handlePriceCommit = (val: number[]) => {
    // Cuando suelta el slider: marcamos bandera y notificamos
    const next: [number, number] = [val[0] ?? 0, val[1] ?? 0]
    setPriceRange(next)
    setHasTouchedPrice(true)
    onFilterChange({ categories, priceRange: next, inStock, onSale, hasTouchedPrice: true })
  }

  const clearAll = () => {
    setCategories([])
    setPriceRange([0, 1000])
    setInStock(false)
    setOnSale(false)
    setHasTouchedPrice(false)
    onFilterChange({
      categories: [],
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
      hasTouchedPrice: false,
    })
  }

  return (
    <div className="space-y-6 p-4 rounded-lg border">
      <h3 className="font-semibold">Filtros</h3>

      <div className="space-y-3">
        <p className="text-sm font-medium">Categorías</p>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <Checkbox
                checked={categories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Rango de precio</p>
        <Slider
          min={0}
          max={1000}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}   // solo mueve UI
          onValueCommit={handlePriceCommit}  // 🔑 recién aquí aplica filtro real
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString("es-US", { style: "currency", currency: "USD" })}</span>
          <span>{priceRange[1].toLocaleString("es-US", { style: "currency", currency: "USD" })}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(Boolean(v))} />
          <span className="text-sm">Solo en stock</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={onSale} onCheckedChange={(v) => setOnSale(Boolean(v))} />
          <span className="text-sm">En oferta</span>
        </label>
      </div>

      <Button variant="outline" className="w-full" onClick={clearAll}>
        Limpiar filtros
      </Button>
    </div>
  )
}
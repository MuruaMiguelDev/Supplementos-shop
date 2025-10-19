"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/src/lib/utils/currency"

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  inStock: boolean
  onSale: boolean
}

const CATEGORIES = ["Proteínas", "Creatina", "Pre-Entreno", "Aminoácidos", "Vitaminas", "Quemadores"]

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 200],
    inStock: false,
    onSale: false,
  })

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked ? [...filters.categories, category] : filters.categories.filter((c) => c !== category)

    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriceChange = (value: number[]) => {
    // Always ensure min is less than or equal to max
    const min = Math.min(value[0], value[1])
    const max = Math.max(value[0], value[1])
    const newFilters = { ...filters, priceRange: [min, max] as [number, number] }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleStockChange = (checked: boolean) => {
    const newFilters = { ...filters, inStock: checked }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSaleChange = (checked: boolean) => {
    const newFilters = { ...filters, onSale: checked }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
      categories: [],
      priceRange: [0, 200],
      inStock: false,
      onSale: false,
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <h3 className="font-semibold">Categorías</h3>
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={category} className="cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <h3 className="font-semibold">Rango de precio</h3>
          <Slider
            min={0}
            max={200}
            step={10}
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(filters.priceRange[0])}</span>
            <span>{formatCurrency(filters.priceRange[1])}</span>
          </div>
        </div>

        {/* Stock & Sale */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="inStock" checked={filters.inStock} onCheckedChange={handleStockChange} />
            <Label htmlFor="inStock" className="cursor-pointer">
              Solo en stock
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="onSale" checked={filters.onSale} onCheckedChange={handleSaleChange} />
            <Label htmlFor="onSale" className="cursor-pointer">
              En oferta
            </Label>
          </div>
        </div>

        <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  )
}

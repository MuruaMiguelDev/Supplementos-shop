export interface Product {
  id: string
  slug: string
  name: string
  brand?: string
  description: string
  price: number
  compareAtPrice?: number
  tags?: string[]
  categories?: string[]
  flavors?: string[]
  rating?: number
  reviewsCount?: number
  images: string[]
  stock: number
  meta?: Record<string, string | number>
}

export interface ProductFilters {
  categories?: string[]
  brands?: string[]
  objectives?: string[]
  flavors?: string[]
  priceRange?: [number, number]
  sortBy?: "price-asc" | "price-desc" | "popularity" | "rating"
}

export interface PaginatedProducts {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

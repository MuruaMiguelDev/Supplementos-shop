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
  meta?: Record<string, any>
  inStock?: boolean
}

export interface ProductFilters {
  categories?: string[]
  brands?: string[]
  priceRange?: [number, number]
  sortBy?: "price-asc" | "price-desc" | "rating" | "popularity" | "newest"
}

export interface PaginatedProducts {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

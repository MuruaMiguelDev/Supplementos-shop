import type { Product, ProductFilters, PaginatedProducts } from "@/types/product"
import { createClient } from "@/lib/supabase/server"

export async function listProducts(page = 1, pageSize = 12, filters?: ProductFilters): Promise<PaginatedProducts> {
  try {
    const supabase = await createClient()

    // Start building the query
    let query = supabase.from("products").select("*", { count: "exact" })

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      query = query.or(
        `name.ilike.%${searchLower}%,description.ilike.%${searchLower}%,brand.ilike.%${searchLower}%,tags.cs.{${searchLower}}`,
      )
    }

    // Apply category filter
    if (filters?.categories?.length) {
      query = query.overlaps("categories", filters.categories)
    }

    // Apply brand filter
    if (filters?.brands?.length) {
      query = query.in("brand", filters.brands)
    }

    // Apply price range filter
    if (filters?.priceRange) {
      const [min, max] = filters.priceRange
      query = query.gte("price", min).lte("price", max)
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true })
          break
        case "price-desc":
          query = query.order("price", { ascending: false })
          break
        case "rating":
          query = query.order("rating", { ascending: false, nullsFirst: false })
          break
        case "popularity":
          query = query.order("reviews_count", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }
    } else {
      query = query.order("created_at", { ascending: false })
    }

    // Get total count
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true })

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data: products, error } = await query

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return {
        products: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      }
    }

    // Transform database format to Product type
    const transformedProducts: Product[] = (products || []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      tags: p.tags || [],
      categories: p.categories || [],
      flavors: p.flavors || undefined,
      rating: p.rating ? Number(p.rating) : undefined,
      reviewsCount: p.reviews_count || 0,
      images: p.images || [],
      stock: p.stock || 0,
      inStock: p.in_stock || false,
      meta: p.meta || undefined,
    }))

    const totalPages = Math.ceil((count || 0) / pageSize)

    return {
      products: transformedProducts,
      total: count || 0,
      page,
      pageSize,
      totalPages,
    }
  } catch (error) {
    console.error("[v0] Unexpected error in listProducts:", error)
    return {
      products: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("slug", slug).single()

    if (error || !product) {
      console.error("[v0] Error fetching product by slug:", error)
      return null
    }

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      tags: product.tags || [],
      categories: product.categories || [],
      flavors: product.flavors || undefined,
      rating: product.rating ? Number(product.rating) : undefined,
      reviewsCount: product.reviews_count || 0,
      images: product.images || [],
      stock: product.stock || 0,
      inStock: product.in_stock || false,
      meta: product.meta || undefined,
    }
  } catch (error) {
    console.error("[v0] Unexpected error in getProductBySlug:", error)
    return null
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient()

    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error || !product) {
      console.error("[v0] Error fetching product by id:", error)
      return null
    }

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      tags: product.tags || [],
      categories: product.categories || [],
      flavors: product.flavors || undefined,
      rating: product.rating ? Number(product.rating) : undefined,
      reviewsCount: product.reviews_count || 0,
      images: product.images || [],
      stock: product.stock || 0,
      inStock: product.in_stock || false,
      meta: product.meta || undefined,
    }
  } catch (error) {
    console.error("[v0] Unexpected error in getProductById:", error)
    return null
  }
}

export async function getAvailableFilters() {
  try {
    const supabase = await createClient()

    const { data: products, error } = await supabase.from("products").select("categories, brand, price")

    if (error || !products) {
      console.error("[v0] Error fetching filters:", error)
      return {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 100 },
      }
    }

    const categories = Array.from(new Set(products.flatMap((p) => p.categories || [])))
    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[]
    const prices = products.map((p) => Number(p.price))

    return {
      categories,
      brands,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    }
  } catch (error) {
    console.error("[v0] Unexpected error in getAvailableFilters:", error)
    return {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 100 },
    }
  }
}

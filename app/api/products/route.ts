import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Products API called")

    const supabase = await createServerClient()

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || undefined
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || undefined
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined
    const inStock = searchParams.get("inStock") === "true" ? true : undefined
    const onSale = searchParams.get("onSale") === "true" ? true : undefined
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const offset = (page - 1) * limit

    let query = supabase.from("products").select("*", { count: "exact" })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`)
    }

    // Apply category filter
    if (categories && categories.length > 0) {
      query = query.in("category", categories)
    }

    // Apply price range filter
    if (minPrice !== undefined) {
      query = query.gte("price", minPrice)
    }
    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice)
    }

    // Apply stock filter
    if (inStock) {
      query = query.gt("stock", 0)
    }

    // Apply sale filter
    if (onSale) {
      query = query.not("compare_at_price", "is", null)
    }

    // Apply sorting
    const validSortColumns = ["created_at", "price", "name", "rating", "is_featured"]
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "created_at"
    query = query.order(safeSortBy, { ascending: sortOrder === "asc" })

    // Get total count before pagination
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error } = await query

    if (error) {
      console.error("[v0] Error fetching products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Products fetched:", products?.length || 0)

    const transformedProducts = (products || []).map((p: any) => ({
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
      categories: p.category ? [p.category] : [],
      subcategory: p.subcategory,
      tags: p.tags || [],
      benefits: p.benefits || [],
      ingredients: p.ingredients || [],
      usage_instructions: p.usage_instructions,
      warnings: p.warnings,
      rating: p.rating ? Number(p.rating) : undefined,
      reviewsCount: p.reviews_count || 0,
      stock: p.stock || 0,
      inStock: (p.stock || 0) > 0,
      is_new: p.is_new || false,
      is_featured: p.is_featured || false,
      discount: p.compare_at_price
        ? Math.round(((Number(p.compare_at_price) - Number(p.price)) / Number(p.compare_at_price)) * 100)
        : 0,
    }))

    return NextResponse.json({
      products: transformedProducts,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("[v0] Unexpected error in products API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

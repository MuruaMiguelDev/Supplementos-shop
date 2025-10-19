import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string }> } // 👈 params es una Promesa
) {
  try {
    const supabase = await createServerClient()

    // 👇 Desempaquetar params ANTES de usar slug
    const { slug } = await ctx.params

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !product) {
      console.error("[v0] Error fetching product:", error)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const transformedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      image: product.image,
      images: product.image ? [product.image] : [],
      category: product.category,
      categories: product.category ? [product.category] : [],
      subcategory: product.subcategory,
      tags: product.tags || [],
      benefits: product.benefits || [],
      ingredients: product.ingredients || [],
      usage_instructions: product.usage_instructions,
      warnings: product.warnings,
      rating: product.rating != null ? Number(product.rating) : undefined,
      reviewsCount: product.reviews_count || 0,
      stock: product.stock || 0,
      inStock: (product.stock || 0) > 0,
      is_new: product.is_new || false,
      is_featured: product.is_featured || false,
      meta: {
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
      },
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error("[v0] Unexpected error in product API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
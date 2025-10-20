// app/api/products/[slug]/route.ts
import 'server-only'
import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic' // evita cacheo si dependes de cookies

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await getServerSupabase(); // ✅ AWAIT
    const slug = decodeURIComponent(params.slug);

    // maybeSingle() no lanza error si no hay filas; devuelve data = null
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      // Si fuera el típico error de "no hay filas" con single(),
      // puedes mapearlo a 404. Con maybeSingle() no debería suceder.
      console.error('[api] Error fetching product by slug:', error);
      return NextResponse.json({ error: 'Query error' }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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
    };

    return NextResponse.json(transformedProduct, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[api] Unexpected error in product by slug:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
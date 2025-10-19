import 'server-only'
import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

// GET /api/products?search=&page=&limit=&categories=&minPrice=&maxPrice=&inStock=&onSale=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const search = (searchParams.get('search') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 24)))

    const categoriesParam = (searchParams.get('categories') || '').trim()
    const categories = categoriesParam
      ? categoriesParam.split(',').map((c) => c.trim()).filter(Boolean)
      : []

    const minPrice = Number(searchParams.get('minPrice') ?? 0)
    const maxPrice = Number(searchParams.get('maxPrice') ?? 9999999)

    const inStock = (searchParams.get('inStock') || '').toLowerCase() === 'true'
    const onSale = (searchParams.get('onSale') || '').toLowerCase() === 'true'

    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = getServerSupabase()
    let query = supabase.from('products').select('*', { count: 'exact' })

    if (search) {
      // Busca por nombre (ajusta si quieres incluir descripción)
      query = query.ilike('name', `%${search}%`)
    }

    if (categories.length > 0) {
      // Filtra por cualquiera de las categorías
      query = query.in('category', categories)
    }

    // Rango de precios
    query = query.gte('price', isNaN(minPrice) ? 0 : minPrice)
                 .lte('price', isNaN(maxPrice) ? 9999999 : maxPrice)

    if (inStock) {
      query = query.gt('stock', 0)
    }

    if (onSale) {
      // Supabase no permite comparar columnas directamente; usamos que "esté seteado"
      query = query.not('compare_at_price', 'is', null)
    }

    // Orden estable y seguro (evitamos depender de created_at si no existe)
    query = query.order('is_featured', { ascending: false }).order('name', { ascending: true })

    // Paginación
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error /api/products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products: data ?? [],
      total,
      page,
      limit,
      totalPages,
    })
  } catch (err) {
    console.error('API /products failed:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
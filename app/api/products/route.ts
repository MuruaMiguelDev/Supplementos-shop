// app/api/products/route.ts
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic"; // evita cacheo del handler

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "12");
    const search = (searchParams.get("search") ?? "").trim();
    const categories = (searchParams.get("categories") ?? "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock") === "true";
    const onSale = searchParams.get("onSale") === "true";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await getServerSupabase(); // 👈 async

    // Cambia "products" por tu tabla o vista real
    let q = supabase.from("products").select("*", { count: "exact" });

    if (search) q = q.ilike("name", `%${search}%`);
    if (categories.length) q = q.in("category", categories);
    if (minPrice) q = q.gte("price", Number(minPrice));
    if (maxPrice) q = q.lte("price", Number(maxPrice));
    if (inStock) q = q.gt("stock", 0);
    // Si manejas precio de lista vs oferta:
    if (onSale) q = q.not("compare_at_price", "is", null).lt("price", Number.MAX_SAFE_INTEGER);

    const { data, error, count } = await q
      .range(from, to)
      .order("name", { ascending: true });

    if (error) {
      console.error("/api/products error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        products: data ?? [],
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("/api/products unexpected:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
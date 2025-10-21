// app/api/admin/products/template/route.ts
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const headers = [
    "id","slug","name","brand","description","price","compare_at_price",
    "tags","categories","flavors","rating","reviews_count","images","stock","meta"
  ]

  const sample = [
    [
      "uuid-opcional",
      "producto-ejemplo",
      "Producto de ejemplo",
      "MarcaX",
      "Descripción breve",
      "19.99",
      "24.99",
      '["proteína","vegano"]',
      '["Proteínas","Veganos"]',
      '["Chocolate","Vainilla"]',
      "4.5",
      "10",
      '["/img1.jpg","/img2.jpg"]',
      "100",
      '{"servings":30,"notes":"campo libre"}'
    ]
  ]

  const csv = [headers.join(","), ...sample.map(r => r.map(v => {
    // Escapar comillas si hace falta
    const s = String(v ?? "")
    return s.includes(",") || s.includes("\"") ? `"${s.replace(/"/g, '""')}"` : s
  }).join(","))].join("\n")

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products_import_template.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
// app/api/admin/products/import/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"
import iconv from "iconv-lite"

type RowIn = {
  id?: string
  slug?: string
  name?: string
  brand?: string
  description?: string
  price?: string | number
  compare_at_price?: string | number
  image?: string
  category?: string
  subcategory?: string
  stock?: string | number
  is_featured?: string | boolean | number
  is_new?: string | boolean | number
  rating?: string | number
  reviews_count?: string | number
  tags?: string | string[] | null
  benefits?: string | string[] | null
  ingredients?: string | string[] | null
  usage_instructions?: string | null
  warnings?: string | null
  created_at?: string
  updated_at?: string
}

// ---- Helpers ----
function toBool(v?: string | boolean | number | null) {
  if (v === null || v === undefined) return null
  if (typeof v === "boolean") return v
  if (typeof v === "number") return v !== 0
  const s = String(v).trim().toLowerCase()
  if (["true", "1", "yes", "si", "sí"].includes(s)) return true
  if (["false", "0", "no"].includes(s)) return false
  return null
}

/**
 * Convierte una celda a text[] (array de strings) para Postgres.
 * Acepta JSON array ["a","b"] o coma-separado a,b
 */
function toTextArray(v?: string | string[] | null) {
  if (v == null) return null
  if (Array.isArray(v)) return v.map((x) => String(x))
  const s = String(v).trim()
  if (!s) return null

  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed.map((x) => String(x))
    } catch {
      // Fallback a coma-separado
    }
  }

  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => String(x))
}

export const runtime = "nodejs"

// Usa Service Role (solo servidor) o cambia por createServerClient() si prefieres sesión admin
function getAdminSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor"
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---- Handler principal ----
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Archivo no enviado" }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const filename = (file.name || "").toLowerCase()

    let rows: RowIn[] = []

    if (filename.endsWith(".csv")) {
      // --- Manejo de codificación automática ---
      let text = iconv.decode(buf, "utf8")

      // Si aparecen caracteres mal formados, intenta Latin-1
      if (/[Ã�]/.test(text)) {
        const latin1 = iconv.decode(buf, "latin1")
        if (/[áéíóúñÁÉÍÓÚÑ]/.test(latin1)) {
          text = latin1
        }
      }

      const wb = XLSX.read(text, { type: "string" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<RowIn>(sheet, { raw: false, defval: "" })
    } else {
      // XLSX / XLS
      const wb = XLSX.read(buf, { type: "buffer" })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<RowIn>(sheet, { raw: false, defval: "" })
    }

    const supabase = getAdminSupabase()

    let created = 0
    let updated = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.slug && !r.id) {
        errors.push(`Fila ${i + 2}: falta 'slug' o 'id' para upsert`)
        continue
      }

      const payload: Record<string, any> = {
        id: r.id || undefined,
        slug: r.slug || undefined,
        name: r.name ?? null,
        brand: r.brand ?? null,
        description: r.description ?? null,
        price: r.price != null ? Number(r.price) : 0,
        compare_at_price: r.compare_at_price != null ? Number(r.compare_at_price) : null,
        image: r.image ?? null,
        category: r.category ?? null,
        subcategory: r.subcategory ?? null,
        stock: r.stock != null ? Number(r.stock) : 0,
        is_featured: toBool(r.is_featured) ?? false,
        is_new: toBool(r.is_new) ?? false,
        rating: r.rating != null ? Number(r.rating) : null,
        reviews_count: r.reviews_count != null ? Number(r.reviews_count) : 0,

        // text[]
        tags: toTextArray(r.tags),
        benefits: toTextArray(r.benefits),
        ingredients: toTextArray(r.ingredients),

        // TEXT
        usage_instructions: r.usage_instructions ?? null,
        warnings: r.warnings ?? null,
      }

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

      try {
        const keyCol = payload.slug ? "slug" : "id"
        const keyVal = payload.slug ?? payload.id

        const { data: existsData, error: existsErr } = await supabase
          .from("products")
          .select("id")
          .eq(keyCol, keyVal)
          .maybeSingle()
        if (existsErr) throw existsErr

        const exists = !!existsData

        const { error } = await supabase
          .from("products")
          .upsert(payload, { onConflict: payload.slug ? "slug" : "id" })
        if (error) throw error

        if (exists) {
          updated++
        } else {
          created++
        }
      } catch (e: any) {
        errors.push(
          `Fila ${i + 2}${
            r.slug ? ` (slug ${r.slug})` : r.id ? ` (id ${r.id})` : ""
          }: ${e?.message || "Error"}`
        )
      }
    }

    return NextResponse.json({ created, updated, errors })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error inesperado en importación" },
      { status: 500 }
    )
  }
}
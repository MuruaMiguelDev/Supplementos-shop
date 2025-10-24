// app/api/mp/create-payment/route.ts
import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

export const runtime = "nodejs"               // 👈 fuerza Node (SDK MP lo requiere)
export const dynamic = "force-dynamic"        // evita caché

// Supabase admin (server-only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!      // 👈 service role (no usar en cliente)
)

// MP client
const MP_TOKEN = process.env.MP_ACCESS_TOKEN
if (!MP_TOKEN) {
  // no lanzamos aquí para no romper build, validamos en request
}
const mpClient = new MercadoPagoConfig({ accessToken: MP_TOKEN || "" })

export async function POST(req: Request) {
  const idem = req.headers.get("x-idempotency-key") || randomUUID()

  try {
    // 1) Validar envs críticas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Faltan env de Supabase (URL o SERVICE_ROLE_KEY)" },
        { status: 500 }
      )
    }
    if (!MP_TOKEN) {
      return NextResponse.json(
        { error: "Falta MP_ACCESS_TOKEN en env" },
        { status: 500 }
      )
    }

    // 2) Parse body
    const body = await req.json().catch(() => null)
    if (!body || !body.orderId || !body.formData) {
      return NextResponse.json(
        { error: "Body inválido. Requiere { orderId, formData }" },
        { status: 400 }
      )
    }
    const { orderId, formData } = body

    // 3) Buscar orden
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total, customer_email")
      .eq("id", orderId)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }

    // 4) Validar monto y token del Brick
    const amount = Number(order.total)
    if (!amount || Number.isNaN(amount)) {
      return NextResponse.json({ error: "Monto inválido en la orden" }, { status: 400 })
    }
    const token = formData?.token
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token de tarjeta ausente/ inválido" }, { status: 400 })
    }

    // 5) Crear pago
    const payment = new Payment(mpClient)
    const paymentRes = await payment.create({
      body: {
        transaction_amount: amount,
        token,
        installments: Number(formData.installments || 1),
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: order.customer_email || formData?.payer?.email,
          identification: formData?.payer?.identification, // { type, number }
        },
        description: `Pago de orden ${orderId}`,
        // external_reference: String(orderId),
      },
      requestOptions: { idempotencyKey: idem },
    })

    // 6) Actualizar orden
    const mp_status = paymentRes.status as string | null
    const mp_status_detail = paymentRes.status_detail as string | null
    const mp_payment_id = String(paymentRes.id ?? "")

    let payment_status: string = "pending"
    if (mp_status === "approved") payment_status = "paid"
    else if (mp_status === "rejected") payment_status = "rejected"

    const { error: updErr } = await supabase
      .from("orders")
      .update({
        mp_payment_id,
        mp_status,
        mp_status_detail,
        payment_status,
      })
      .eq("id", orderId)

    if (updErr) {
      // no rompemos si el pago se creó
      console.error("Supabase update error:", updErr.message)
    }

    return NextResponse.json({
      id: mp_payment_id,
      status: mp_status,
      status_detail: mp_status_detail,
    })
  } catch (err: any) {
    // 👇 devuelve la causa (útil en consola)
    const msg = err?.message || String(err)
    console.error("create-payment error:", msg, err?.response ?? "")
    // Si el SDK de MP trae detalles:
    const mpErr = err?.cause || err?.response
    return NextResponse.json(
      { error: "Error procesando pago", details: msg, mp: mpErr },
      { status: 500 }
    )
  }
}

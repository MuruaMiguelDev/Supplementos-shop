import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

// ─────────────────────────────────────────────────────────────
// Supabase (server-side con service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─────────────────────────────────────────────────────────────
// Mercado Pago SDK v2: cliente + recurso Payment
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: Request) {
  try {
    const headers = new Headers(req.headers)
    const idem = headers.get("x-idempotency-key") || randomUUID()

    const { orderId, formData } = await req.json() as {
      orderId?: string
      formData?: any
    }

    if (!orderId || !formData) {
      return NextResponse.json(
        { error: "Faltan parámetros: orderId y formData son requeridos" },
        { status: 400 }
      )
    }

    // 1) Obtener la orden para conocer el monto (y email por las dudas)
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total, customer_email")
      .eq("id", orderId)
      .single()

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      )
    }

    const amount = Number(order.total || 0)
    if (!amount || Number.isNaN(amount)) {
      return NextResponse.json(
        { error: "Monto inválido en la orden" },
        { status: 400 }
      )
    }

    // 2) Crear el pago con la SDK nueva
    const payment = new Payment(mpClient)

    const paymentBody = {
      transaction_amount: amount,
      token: formData.token,                    // <- viene del Brick
      installments: Number(formData.installments || 1),
      payment_method_id: formData.payment_method_id,
      issuer_id: formData.issuer_id,
      payer: {
        email: order.customer_email || formData?.payer?.email,
        identification: formData?.payer?.identification, // { type, number }
      },
      // Puedes setear descripción, external_reference, etc:
      description: `Pago de orden ${orderId}`,
      // external_reference: orderId as string,
    }

    const paymentRes = await payment.create({
      body: paymentBody,
      requestOptions: {
        idempotencyKey: idem, // 👈 idempotencia a nivel MP
      },
    })

    // 3) Actualizar la orden en Supabase con datos del pago
    const mp_status = paymentRes.status as string | null
    const mp_status_detail = paymentRes.status_detail as string | null
    const mp_payment_id = String(paymentRes.id ?? "")

    // Map simple de estado de pago en tu tabla
    let payment_status: string = "pending"
    if (mp_status === "approved") payment_status = "paid"
    else if (mp_status === "rejected") payment_status = "rejected"
    else if (mp_status === "in_process" || mp_status === "pending") payment_status = "pending"

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
      // No abortamos la respuesta si el pago salió bien,
      // pero informamos el problema de actualización.
      console.error("Supabase update error:", updErr.message)
    }

    // 4) Responder al frontend/Brick
    return NextResponse.json({
      id: mp_payment_id,
      status: mp_status,
      status_detail: mp_status_detail,
    })
  } catch (err: any) {
    console.error("Create-payment route error:", err?.message || err)
    return NextResponse.json(
      { error: "Error procesando el pago" },
      { status: 500 }
    )
  }
}

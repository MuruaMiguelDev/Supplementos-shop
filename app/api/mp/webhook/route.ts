import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // necesario para el SDK de MP

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Seguridad simple por query param (recomendado mantenerlo)
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    if (!secret || secret !== process.env.MP_WEBHOOK_SECRET) {
      // Ignoramos notificaciones no firmadas para no filtrar info
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Mercado Pago puede enviar { type, action, data: { id } }
    const body = await req.json().catch(() => ({} as any));
    const type = body?.type || url.searchParams.get("type"); // compatibilidad
    const action = body?.action;
    const paymentId = body?.data?.id;

    // Solo procesamos si hay paymentId claramente
    const isPaymentEvent =
      type === "payment" ||
      action === "payment.created" ||
      action === "payment.updated" ||
      Boolean(paymentId);

    if (!isPaymentEvent) {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    if (!paymentId) {
      return NextResponse.json({ missing: "paymentId" }, { status: 200 });
    }

    // Consultamos el pago para obtener metadata (orderId)
    const payment = await new Payment(mp).get({ id: paymentId });
    const orderId = payment?.metadata?.orderId;

    if (!orderId) {
      // Si el pago no trae metadata de orderId, no podemos mapear
      return NextResponse.json({ noOrder: true }, { status: 200 });
    }

    // Traemos la orden incluyendo mp_payment_id si existe en el schema
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, notes, mp_payment_id")
      .eq("id", orderId)
      .single();

    // Preparamos updates
    const updates: Record<string, any> = {
      payment_status: payment.status, // 'approved' | 'in_process' | 'rejected' | ...
      status: payment.status === "approved" ? "paid" : "pending",
      updated_at: new Date().toISOString(),
    };

    if (order && typeof order.mp_payment_id !== "undefined") {
      updates["mp_payment_id"] = String(payment.id ?? "");
    } else {
      const prefix = `[MP webhook payment_id=${payment.id ?? "?"} status=${payment.status ?? "?"}]`;
      updates["notes"] = order?.notes ? `${prefix} ${order.notes}` : prefix;
    }

    await supabaseAdmin.from("orders").update(updates).eq("id", orderId);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e) {
    console.error("Webhook error:", e);
    // Siempre 200 para que MP no reintente indefinidamente si fue un error temporal
    return NextResponse.json({ received: false }, { status: 200 });
  }
}

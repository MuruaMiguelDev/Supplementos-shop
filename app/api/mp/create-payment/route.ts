import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BrickFormData = {
  token: string
  payment_method_id: string
  issuer_id?: number | string        // 👈 puede venir string
  installments?: number | string     // 👈 puede venir string
  payer: {
    email: string
    identification?: { type: string; number: string }
  }
}

export async function POST(req: Request) {
  try {
    const { orderId, formData } = (await req.json()) as {
      orderId: string | number;
      formData: BrickFormData;
    };

    // Validación defensiva del formData
    if (!formData?.token || !formData?.payment_method_id) {
      return NextResponse.json(
        { error: "Missing card data", detail: formData },
        { status: 400 }
      );
    }

    // Traer orden
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,total,status,payment_status,customer_email,notes,mp_payment_id")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

const issuerId =
  formData.issuer_id !== undefined && formData.issuer_id !== null && `${formData.issuer_id}` !== ""
    ? Number(formData.issuer_id)
    : undefined

const installments =
  formData.installments !== undefined && formData.installments !== null && `${formData.installments}` !== ""
    ? Number(formData.installments)
    : 1
    
    // Crear pago
const payment = await new Payment(mp).create({
  body: {
    transaction_amount: Number(order.total),
    token: formData.token,
    description: `Orden #${orderId}`,
    installments,                 // 👈 ya es number
    payment_method_id: formData.payment_method_id,
    issuer_id: issuerId,          // 👈 ya es number | undefined
    payer: {
      email: formData.payer?.email || order.customer_email,
      identification: formData.payer?.identification,
    },
    metadata: { orderId },
  },
})

    const updates: Record<string, any> = {
      payment_status: payment.status,
      status: payment.status === "approved" ? "paid" : "pending",
      updated_at: new Date().toISOString(),
    };

    if (typeof order.mp_payment_id !== "undefined") {
      updates["mp_payment_id"] = String(payment.id ?? "");
    } else {
      const prefix = `[MP payment_id=${payment.id ?? "?"} status=${payment.status ?? "?"}]`;
      updates["notes"] = order.notes ? `${prefix} ${order.notes}` : prefix;
    }

    await supabaseAdmin.from("orders").update(updates).eq("id", orderId);

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      orderId,
    });
  } catch (e: any) {
    // console.error("MP create-payment error:", e);
    return NextResponse.json(
      { error: e?.message || "Error al procesar el pago" },
      { status: 500 }
    );
  }
}

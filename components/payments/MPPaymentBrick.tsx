"use client";

import { useEffect, useMemo, useRef } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

type Props = {
  orderId: string | number;
  amount: number;
  buyerEmail: string;
  onApproved?: (orderId: string | number) => void;
  onLoadingChange?: (loading: boolean, message?: string) => void;
};

export default function MPPaymentBrick({
  orderId,
  amount,
  buyerEmail,
  onApproved,
  onLoadingChange,
}: Props) {
  const mountedOnceRef = useRef(false);
  const submittingRef = useRef(false);

  const idempotencyKey = useMemo(() => {
    if (typeof window === "undefined") return crypto.randomUUID();
    const keyName = `pay_attempt_${orderId}`;
    const existing = sessionStorage.getItem(keyName);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(keyName, fresh);
    return fresh;
  }, [orderId]);

  useEffect(() => {
    if (!mountedOnceRef.current) {
      mountedOnceRef.current = true;
      const pk = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
      if (!pk) {
        console.error("[MP] Falta NEXT_PUBLIC_MP_PUBLIC_KEY en el cliente");
        onLoadingChange?.(false,);
        alert("Error de configuración: falta la clave pública de Mercado Pago (NEXT_PUBLIC_MP_PUBLIC_KEY).");
        return;
      }
      onLoadingChange?.(true, "Cargando medios de pago…");
      initMercadoPago(pk, { locale: "es-AR" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialization = useMemo(
    () => ({
      amount: Number(amount),
      payer: { email: buyerEmail },
    }),
    [amount, buyerEmail]
  );

  const cleanupSession = () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("order_id");
      sessionStorage.removeItem(`pay_attempt_${orderId}`);
    } catch {}
  };

const onSubmit = async ({ formData }: any, _additional?: any): Promise<void> => {
  if (submittingRef.current) return;
  submittingRef.current = true;

  try {
    onLoadingChange?.(true, "Procesando pago…");

    console.log("[MP] formData recibido del Brick:", formData);

    const token = formData?.token;
    const pmId = formData?.payment_method_id;
    const issuerId = formData?.issuer_id;
    const installments = formData?.installments;

    if (!token) {
      onLoadingChange?.(false);
      alert(
        "No se pudo generar el token de la tarjeta.\n\n" +
        "• Verifica NEXT_PUBLIC_MP_PUBLIC_KEY\n" +
        "• Completa todos los campos (incluido DNI en AR)\n" +
        "• Usa una tarjeta de prueba válida"
      );
      return; // 👈 sin objeto
    }

    const res = await fetch("/api/mp/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        orderId,
        formData: {
          token,
          payment_method_id: pmId,
          issuer_id: issuerId,
          installments: Number(installments || 1),
          payer: {
            ...(formData?.payer || {}),
            email: buyerEmail,
          },
        },
      }),
    });

    const data = await res.json();
    console.log("[MP] Respuesta create-payment:", data);

    if (res.ok && (data.status === "approved" || data?.payment?.status === "approved")) {
      cleanupSession();
      onApproved?.(orderId);
      window.location.href = `/pedido-confirmado?o=${orderId}`;
      return; // 👈 sin objeto
    }

    alert(`Pago no aprobado.\nEstado: ${data?.status || "desconocido"}\nDetalle: ${data?.status_detail || data?.mp?.message || "—"}`);
    return; // 👈 sin objeto
  } catch (err) {
    console.error("[MP] Error en create-payment:", err);
    alert("Ocurrió un error al procesar el pago.");
    return; // 👈 sin objeto
  } finally {
    onLoadingChange?.(false);
    submittingRef.current = false;
  }
};

  const onReady = () => {
    onLoadingChange?.(false);
  };

  const onError = (err: any) => {
    console.error("[MP] Error del Brick:", err);
    onLoadingChange?.(false);
    submittingRef.current = false;
  };

  return (
    <CardPayment
      initialization={initialization}
      customization={{
        visual: { style: { theme: "dark" } },
        // paymentMethods: { excludedPaymentTypes: ["ticket", "bank_transfer"] }
      }}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={onError}
    />
  );
}
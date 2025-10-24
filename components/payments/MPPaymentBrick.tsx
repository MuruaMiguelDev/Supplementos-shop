"use client";

import { useEffect, useMemo, useRef } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

type Props = {
  orderId: string | number;
  amount: number; // Monto en ARS, con decimales válidos (p.ej. 29033.95)
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
  // Evita doble init en StrictMode
  const mountedOnceRef = useRef(false);
  // Evita doble submit del Brick (clicks rápidos / re-disparo del evento)
  const submittingRef = useRef(false);

  // Idempotency-Key estable por orden (persiste entre reintentos hasta éxito)
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
      onLoadingChange?.(true, "Cargando medios de pago…");
      initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "es-AR" });
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
      sessionStorage.removeItem("order_id");            // limpiamos el ID de la orden (flujo completado)
      sessionStorage.removeItem(`pay_attempt_${orderId}`); // limpiamos el intento de pago
    } catch {}
  };

  const onSubmit = async ({ formData }: any) => {
    if (submittingRef.current) return; // 💥 bloqueo anti doble envío
    submittingRef.current = true;

    try {
      onLoadingChange?.(true, "Procesando pago…");

      // IMPORTANTE:
      // Este endpoint /api/mp/create-payment debe:
      //  - Usar la Idempotency-Key para no crear múltiples pagos por el mismo intento.
      //  - Actualizar la orden (upsert) por 'id' con el estado correspondiente.
      const res = await fetch("/api/mp/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Clave de idempotencia (debe ser forwardeada por tu ruta al request de MP si creas pagos directos)
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          orderId,
          formData: {
            ...formData,
            payer: {
              ...(formData?.payer || {}),
              email: buyerEmail, // forzamos email del checkout
            },
          },
        }),
      });

      const data = await res.json();

      if (res.ok && (data.status === "approved" || data.payment?.status === "approved")) {
        // Limpieza de storage: orden finalizada
        cleanupSession();

        // Callback del padre (para vaciar carrito, etc.)
        onApproved?.(orderId);

        // Redirección a confirmación
        window.location.href = `/pedido-confirmado?o=${orderId}`;
        return;
      }

      // Si no fue aprobado, no limpiamos la sesión para permitir reintento idempotente.
      // Podés leer data.status / data.status_detail y mostrar un toast en el padre si lo deseás.
    } catch (_err) {
      // console.error("MP create-payment error:", _err);
      // No limpiamos sesión para permitir reintento
    } finally {
      onLoadingChange?.(false);
      submittingRef.current = false;
    }
  };

  const onReady = () => {
    onLoadingChange?.(false);
  };

  const onError = (_err: any) => {
    // console.error("CardPayment Brick error:", _err);
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
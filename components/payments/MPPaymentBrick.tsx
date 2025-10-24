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
  // Evita doble ejecución del efecto en StrictMode
  const mountedOnceRef = useRef(false);

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

  const onSubmit = async ({ formData }: any) => {
    try {
      // formData de CardPayment trae: token, payment_method_id, issuer_id, installments,
      // payer: { email, identification: { type, number } }
      onLoadingChange?.(true, "Procesando pago…");

      // Opcional: log para depurar en dev (quitar en prod)
      // console.log("MP formData:", formData);

      const res = await fetch("/api/mp/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (res.ok && data.status === "approved") {
        onApproved?.(orderId);
        window.location.href = `/pedido-confirmado?o=${orderId}`;
      } else {
        // Puedes mostrar un toast usando data.status / data.status_detail
        // y dejar el brick visible para reintentar
      }
    } catch (err) {
      // console.error("MP create-payment error:", err);
    } finally {
      onLoadingChange?.(false);
    }
  };

  const onReady = () => {
    onLoadingChange?.(false);
  };

  const onError = (_err: any) => {
    // console.error("CardPayment Brick error:", _err);
    onLoadingChange?.(false);
  };

  return (
    <CardPayment
      initialization={initialization}
      customization={{
        visual: { style: { theme: "dark" } },
        // Si quieres forzar sólo crédito/débito, puedes excluir medios aquí
        // paymentMethods: { excludedPaymentTypes: ["ticket", "bank_transfer"] }
      }}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={onError}
    />
  );
}

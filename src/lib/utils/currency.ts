export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount)
}

export function calculateDiscount(price: number, discountValue: number, discountType: "percent" | "amount"): number {
  if (discountType === "percent") {
    return price * (1 - discountValue / 100)
  }
  return Math.max(0, price - discountValue)
}

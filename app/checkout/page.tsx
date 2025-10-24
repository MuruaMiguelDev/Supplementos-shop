"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/src/lib/store/cart"
import { formatCurrency } from "@/src/lib/utils/currency"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CreditCard, Truck, MapPin, Tag, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import MPPaymentBrick from "@/components/payments/MPPaymentBrick"

/** Overlay de carga inline */
function LoadingOverlay({ show, text = "Procesando..." }: { show: boolean; text?: string }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-xl bg-white dark:bg-neutral-900 px-5 py-4 shadow-xl flex items-center gap-3">
        <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const { toast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [showBrick, setShowBrick] = useState(false)

  const [overlay, setOverlay] = useState<{ show: boolean; text?: string }>({
    show: false,
    text: "",
  })

  // versión estable y con guard para no re-renderizar si no cambia
  const setLoading = useCallback((loading: boolean, text?: string) => {
    setOverlay((prev) => {
      const nextText = text || "Procesando..."
      if (prev.show === loading && prev.text === nextText) return prev
      return { show: loading, text: nextText }
    })
  }, [])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "card" as "card" | "cash",
    notes: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        setUserId(user.id)
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (profile) {
          setFormData((prev) => ({
            ...prev,
            firstName: profile.full_name?.split(" ")[0] || "",
            lastName: profile.full_name?.split(" ").slice(1).join(" ") || "",
            email: user.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
            zipCode: profile.zip_code || "",
          }))
        }
      }
    }
    checkAuth()
  }, [])

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 5

  let discount = 0
  if (appliedCoupon) {
    discount = appliedCoupon.discount_type === "percentage"
      ? subtotal * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
  }

  const subtotalAfterDiscount = subtotal - discount
  const tax = subtotalAfterDiscount * 0.21
  const total = subtotalAfterDiscount + shipping + tax

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Error", description: "Ingresa un código de cupón", variant: "destructive" })
      return
    }
    setIsApplyingCoupon(true)
    try {
      const supabase = createClient()
      const { data: coupon, error } = await supabase
        .from("coupons").select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single()

      if (error || !coupon) {
        toast({ title: "Cupón inválido", description: "El código de cupón no existe o ha expirado", variant: "destructive" })
        return
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({ title: "Cupón expirado", description: "Este cupón ya no es válido", variant: "destructive" })
        return
      }
      setAppliedCoupon(coupon)
      toast({
        title: "Cupón aplicado",
        description: `Has obtenido ${coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)} de descuento`,
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "No se pudo aplicar el cupón", variant: "destructive" })
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast({ title: "Cupón removido" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }))

  /** Helper: obtiene o crea un ID de orden estable para idempotencia */
  const getOrCreateOrderId = () => {
    if (typeof window === "undefined") return crypto.randomUUID()
    const existing = sessionStorage.getItem("order_id")
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem("order_id", id)
    return id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Evita doble envío por clicks/refresh
    if (isProcessing || overlay.show) return
    setIsProcessing(true)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({ title: "Error", description: "Por favor completa todos los campos requeridos", variant: "destructive" })
      setIsProcessing(false); return
    }
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({ title: "Error", description: "Por favor completa la dirección de envío", variant: "destructive" })
      setIsProcessing(false); return
    }

    try {
      const supabase = createClient()
      setLoading(true, "Creando orden…")

      // 🔑 ID estable para la orden (idempotente)
      const orderId = getOrCreateOrderId()

      const orderData = {
        id: orderId, // 👈 clave para upsert idempotente
        user_id: userId,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_zip: formData.zipCode,
        items: items.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount_amount: discount,
        total,
        payment_method: formData.paymentMethod,
        payment_status: "pending",
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: discount,
        notes: formData.notes || null,
      }

      // ✅ UPSERT idempotente (evita 409 por duplicados)
      const { data: order, error } = await supabase
        .from("orders")
        .upsert(orderData, { onConflict: "id" })
        .select()
        .single()

      if (error || !order) {
        setLoading(false)
        toast({ title: "Error", description: "No se pudo procesar el pedido. Intenta nuevamente.", variant: "destructive" })
        setIsProcessing(false); return
      }

      // Persistimos el id por si el usuario refresca antes de pagar
      if (typeof window !== "undefined") {
        sessionStorage.setItem("order_id", orderId)
      }

      if (formData.paymentMethod === "card") {
        setCreatedOrder(order)
        setShowBrick(true)
        setIsProcessing(false)
        setLoading(true, "Cargando medios de pago…") // se corta en onReady del Brick
        toast({ title: "Orden creada", description: "Completa el pago para finalizar." })
        return
      }

      // cash
      if (appliedCoupon && isAuthenticated && userId) {
        await supabase.from("coupons").update({ times_used: (appliedCoupon.times_used || 0) + 1 }).eq("id", appliedCoupon.id)
        await supabase.from("user_coupons")
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("coupon_id", appliedCoupon.id)
      }

      clearCart()
      setLoading(false)
      toast({ title: "¡Pedido realizado con éxito!", description: `Tu número de pedido es: ${order.order_number}` })
      router.push(`/pedido-confirmado?order=${order.order_number}`)
    } catch (error) {
      console.error("Error processing order:", error)
      setLoading(false)
      toast({ title: "Error", description: "Ocurrió un error al procesar tu pedido", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <CreditCard className="size-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No hay productos en el carrito</h2>
            <p className="text-muted-foreground mb-6">Agrega productos antes de proceder al checkout</p>
            <Button asChild><Link href="/productos">Explorar Productos</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/carrito"><ArrowLeft className="mr-2 h-4 w-4" />Volver al carrito</Link>
      </Button>

      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Información Personal</CardTitle>
                <CardDescription>Completa tus datos de contacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </CardContent>
            </Card>

            {/* Dirección de Envío */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Dirección de Envío</CardTitle>
                <CardDescription>¿Dónde quieres recibir tu pedido?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Calle, número, departamento, etc." required />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Provincia *</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Código Postal *</Label>
                    <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Método de Pago</CardTitle>
                <CardDescription>Selecciona cómo deseas pagar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  className="grid gap-3"
                  value={formData.paymentMethod}
                  onValueChange={(v) => setFormData((f) => ({ ...f, paymentMethod: v as "card" | "cash" }))}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem
                      id="card"
                      value="card"
                      className="aspect-square size-4 shrink-0 rounded-full border border-input shadow-xs outline-none transition-[color,box-shadow] text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-[checked=true]:ring-[3px] aria-[checked=true]:ring-ring/50 dark:bg-input/30"
                    />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium">Tarjeta de Crédito/Débito (Mercado Pago)</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem
                      id="cash"
                      value="cash"
                      className="aspect-square size-4 shrink-0 rounded-full border border-input shadow-xs outline-none transition-[color,box-shadow] text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-[checked=true]:ring-[3px] aria-[checked=true]:ring-ring/50 dark:bg-input/30"
                    />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="font-medium">Pago contra entrega</div>
                      <div className="text-sm text-muted-foreground">Solo válido para Córdoba Capital.</div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Brick al elegir tarjeta y tener orden creada */}
                {formData.paymentMethod === "card" && showBrick && createdOrder && (
                  <div className="mt-6">
                    <MPPaymentBrick
                      orderId={createdOrder.id}
                      amount={Number(createdOrder.total)}
                      buyerEmail={createdOrder.customer_email || formData.email}
                      onApproved={() => { clearCart(); }}
                      onLoadingChange={setLoading}
                    />
                  </div>
                )}

                {formData.paymentMethod !== "card" && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    {formData.paymentMethod === "cash" ? "Recibirás confirmación y coordinaremos el pago en la entrega." : null}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notas Adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
                <CardDescription>¿Alguna instrucción especial para tu pedido?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Ej: Dejar en recepción, tocar timbre, etc." rows={4} />
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Pedido */}
          <div>
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative size-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.product.images[0] || "/placeholder.svg"} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cupón */}
                <div className="space-y-2">
                  <Label htmlFor="coupon" className="flex items-center gap-2"><Tag className="size-4" />Código de Cupón</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <Check className="size-4 text-primary" />
                      <span className="flex-1 font-mono text-sm font-medium">{appliedCoupon.code}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCoupon} className="size-6 p-0"><X className="size-4" /></Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input id="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="CODIGO123" className="font-mono" />
                      <Button type="button" onClick={handleApplyCoupon} variant="outline" disabled={isApplyingCoupon} className="bg-transparent">
                        {isApplyingCoupon ? "..." : "Aplicar"}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Descuento</span><span className="font-medium text-primary">-{formatCurrency(discount)}</span></div>
                  )}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Envío</span><span className="font-medium">{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">IVA (21%)</span><span className="font-medium">{formatCurrency(tax)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
                  {appliedCoupon && discount > 0 && <Badge variant="secondary" className="w-full justify-center">Ahorraste {formatCurrency(discount)}</Badge>}
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isProcessing || overlay.show}>
                  {isProcessing ? "Procesando..." : formData.paymentMethod === "card" && showBrick && createdOrder ? "Completa el pago abajo" : "Confirmar Pedido"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>

      <LoadingOverlay show={overlay.show} text={overlay.text} />
    </div>
  )
}
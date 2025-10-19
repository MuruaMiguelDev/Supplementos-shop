"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "card",
    notes: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsAuthenticated(true)
        setUserId(user.id)

        // Load user profile to pre-fill form
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
    if (appliedCoupon.discount_type === "percentage") {
      discount = subtotal * (appliedCoupon.discount_value / 100)
    } else {
      discount = appliedCoupon.discount_value
    }
  }

  const subtotalAfterDiscount = subtotal - discount
  const tax = subtotalAfterDiscount * 0.16 // 16% IVA
  const total = subtotalAfterDiscount + shipping + tax

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un código de cupón",
        variant: "destructive",
      })
      return
    }

    setIsApplyingCoupon(true)
    try {
      const supabase = createClient()

      // Check if coupon exists and is valid
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single()

      if (error || !coupon) {
        toast({
          title: "Cupón inválido",
          description: "El código de cupón no existe o ha expirado",
          variant: "destructive",
        })
        setIsApplyingCoupon(false)
        return
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast({
          title: "Cupón expirado",
          description: "Este cupón ya no es válido",
          variant: "destructive",
        })
        setIsApplyingCoupon(false)
        return
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        toast({
          title: "Cupón agotado",
          description: "Este cupón ha alcanzado su límite de usos",
          variant: "destructive",
        })
        setIsApplyingCoupon(false)
        return
      }

      // Check minimum purchase
      if (coupon.min_purchase && subtotal < coupon.min_purchase) {
        toast({
          title: "Compra mínima no alcanzada",
          description: `Este cupón requiere una compra mínima de ${formatCurrency(coupon.min_purchase)}`,
          variant: "destructive",
        })
        setIsApplyingCoupon(false)
        return
      }

      setAppliedCoupon(coupon)
      toast({
        title: "Cupón aplicado",
        description: `Has obtenido ${coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)} de descuento`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo aplicar el cupón",
        variant: "destructive",
      })
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast({
      title: "Cupón removido",
      description: "El cupón ha sido eliminado de tu pedido",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Error",
        description: "Por favor completa la dirección de envío",
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    try {
      const supabase = createClient()

      // Prepare order data
      const orderData = {
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
          discount: item.product.discount || 0,
        })),
        subtotal: subtotal,
        discount_amount: discount,
        total: total,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === "cash" ? "pending" : "pending",
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: discount,
        notes: formData.notes || null,
      }

      const { data: order, error } = await supabase.from("orders").insert(orderData).select().single()

      if (error) {
        console.error("Error creating order:", error)
        toast({
          title: "Error",
          description: "No se pudo procesar el pedido. Intenta nuevamente.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Update coupon usage if applied
      if (appliedCoupon && isAuthenticated && userId) {
        await supabase
          .from("coupons")
          .update({ times_used: (appliedCoupon.times_used || 0) + 1 })
          .eq("id", appliedCoupon.id)

        await supabase
          .from("user_coupons")
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("coupon_id", appliedCoupon.id)
      }

      clearCart()

      toast({
        title: "¡Pedido realizado con éxito!",
        description: `Tu número de pedido es: ${order.order_number}`,
      })

      router.push(`/pedido-confirmado?order=${order.order_number}`)
    } catch (error) {
      console.error("Error processing order:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu pedido",
        variant: "destructive",
      })
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
            <Button asChild>
              <Link href="/productos">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/carrito">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al carrito
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>Completa tus datos de contacto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dirección de Envío */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
                <CardDescription>¿Dónde quieres recibir tu pedido?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle, número, colonia"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
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
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
                <CardDescription>Selecciona cómo deseas pagar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="font-medium">Tarjeta de Crédito/Débito</div>
                      <div className="text-sm text-muted-foreground">Pago seguro con tarjeta</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Transferencia Bancaria</div>
                      <div className="text-sm text-muted-foreground">Recibirás los datos por email</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="font-medium">Pago contra entrega</div>
                      <div className="text-sm text-muted-foreground">Paga al recibir tu pedido</div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notas Adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Notas Adicionales</CardTitle>
                <CardDescription>¿Alguna instrucción especial para tu pedido?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ej: Dejar en recepción, tocar timbre, etc."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Pedido */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative size-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
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

                <div className="space-y-2">
                  <Label htmlFor="coupon" className="flex items-center gap-2">
                    <Tag className="size-4" />
                    Código de Cupón
                  </Label>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <Check className="size-4 text-primary" />
                      <span className="flex-1 font-mono text-sm font-medium">{appliedCoupon.code}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="size-6 p-0"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="CODIGO123"
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        variant="outline"
                        disabled={isApplyingCoupon}
                        className="bg-transparent"
                      >
                        {isApplyingCoupon ? "..." : "Aplicar"}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento</span>
                      <span className="font-medium text-primary">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (16%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {appliedCoupon && discount > 0 && (
                    <Badge variant="secondary" className="w-full justify-center">
                      Ahorraste {formatCurrency(discount)}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? "Procesando..." : "Confirmar Pedido"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

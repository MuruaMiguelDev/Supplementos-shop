"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CouponsTabProps {
  coupons: any[]
}

export function CouponsTab({ coupons }: CouponsTabProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: "Código copiado",
      description: "El código ha sido copiado al portapapeles",
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Tag className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle>Mis Cupones</CardTitle>
            <CardDescription>Cupones de descuento disponibles</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!coupons || coupons.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No tienes cupones disponibles</p>
            <p className="mt-2 text-sm text-muted-foreground">Refiere amigos para obtener cupones de descuento</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {coupons.map((userCoupon) => {
              const coupon = userCoupon.coupon
              return (
                <Card key={userCoupon.id} className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {coupon.discount_type === "percentage" ? "Porcentaje" : "Monto Fijo"}
                        </Badge>
                        <p className="text-3xl font-bold text-primary">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `$${coupon.discount_value}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">de descuento</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4">{coupon.description}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">{coupon.code}</code>
                      <Button size="sm" variant="outline" onClick={() => handleCopy(coupon.code)} className="shrink-0">
                        {copiedCode === coupon.code ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </Button>
                    </div>
                    {coupon.min_purchase > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">Compra mínima: ${coupon.min_purchase}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import "server-only"
import { getServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateCouponButton } from "./create-coupon-button"
import { DeleteCouponButton } from "./delete-coupon-button"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function CouponsTab() {
  const supabase = await getServerSupabase()

  const { data: coupons = [] } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Cupones</CardTitle>
          <CardDescription>Crea y administra cupones de descuento</CardDescription>
        </div>
        <CreateCouponButton />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Compra Mínima</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Límite de Usos</TableHead>
                <TableHead>Válido Hasta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon: any) => {
                const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date()
                const isMaxedOut = coupon.max_uses && coupon.times_used >= coupon.max_uses
                const isActive = coupon.is_active && !isExpired && !isMaxedOut

                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                    <TableCell className="capitalize">{coupon.discount_type}</TableCell>
                    <TableCell className="font-semibold">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </TableCell>
                    <TableCell>${Number(coupon.min_purchase || 0).toFixed(2)}</TableCell>
                    <TableCell>{coupon.times_used}</TableCell>
                    <TableCell>{coupon.max_uses || "Ilimitado"}</TableCell>
                    <TableCell>
                      {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString("es-MX") : "Sin límite"}
                    </TableCell>
                    <TableCell>
                      {isActive ? (
                        <Badge variant="default">Activo</Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive">Expirado</Badge>
                      ) : isMaxedOut ? (
                        <Badge variant="secondary">Agotado</Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(coupon.created_at), { addSuffix: true, locale: es })}
                    </TableCell>
                    <TableCell>
                      <DeleteCouponButton couponId={coupon.id} couponCode={coupon.code} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
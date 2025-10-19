import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"

export async function AnalyticsTab() {
  const supabase = await createServerClient()

  // Fetch analytics data
  const [
    { data: dailySales },
    { data: productPerformance },
    { data: customerAnalytics },
    { data: referralPerformance },
    { data: topCoupons },
  ] = await Promise.all([
    supabase.from("daily_sales").select("*").limit(7).order("date", { ascending: false }),
    supabase.from("product_performance").select("*").limit(10),
    supabase.from("customer_analytics").select("*").limit(10),
    supabase.from("referral_performance").select("*").limit(10),
    supabase.rpc("get_top_coupons", {}).limit(10),
  ])

  // Calculate totals
  const totalRevenue = dailySales?.reduce((sum, day) => sum + Number(day.total_revenue || 0), 0) || 0
  const totalOrders = dailySales?.reduce((sum, day) => sum + Number(day.total_orders || 0), 0) || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos (7 días)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos (7 días)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Top</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Diarias (Últimos 7 días)</CardTitle>
          <CardDescription>Resumen de ventas por día</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Valor Promedio</TableHead>
                <TableHead>Descuentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailySales?.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{new Date(day.date).toLocaleDateString("es-MX")}</TableCell>
                  <TableCell>{day.total_orders}</TableCell>
                  <TableCell className="font-semibold">${Number(day.total_revenue).toFixed(2)}</TableCell>
                  <TableCell>${Number(day.average_order_value).toFixed(2)}</TableCell>
                  <TableCell className="text-destructive">${Number(day.total_discounts).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>Top 10 productos por ingresos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Veces Ordenado</TableHead>
                <TableHead>Cantidad Total</TableHead>
                <TableHead>Ingresos Totales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productPerformance?.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell>{product.times_ordered}</TableCell>
                  <TableCell>{product.total_quantity}</TableCell>
                  <TableCell className="font-semibold">${Number(product.total_revenue).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Mejores Clientes</CardTitle>
          <CardDescription>Top 10 clientes por valor de vida</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Valor de Vida</TableHead>
                <TableHead>Valor Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerAnalytics?.map((customer) => (
                <TableRow key={customer.user_id}>
                  <TableCell className="font-medium">{customer.customer_name}</TableCell>
                  <TableCell>{customer.customer_email}</TableCell>
                  <TableCell>{customer.total_orders}</TableCell>
                  <TableCell className="font-semibold">${Number(customer.lifetime_value).toFixed(2)}</TableCell>
                  <TableCell>${Number(customer.average_order_value).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Referral Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Referidos</CardTitle>
          <CardDescription>Usuarios con más referidos exitosos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referidor</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Total Referidos</TableHead>
                <TableHead>Convertidos</TableHead>
                <TableHead>Ingresos Generados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralPerformance?.map((referrer) => (
                <TableRow key={referrer.referrer_id}>
                  <TableCell className="font-medium">{referrer.referrer_name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{referrer.referral_code}</code>
                  </TableCell>
                  <TableCell>{referrer.total_referrals}</TableCell>
                  <TableCell>{referrer.converted_referrals}</TableCell>
                  <TableCell className="font-semibold">${Number(referrer.referral_revenue).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

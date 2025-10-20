import "server-only"
import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/supabase/admin"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTab } from "@/components/admin/users-tab"
import { OrdersTab } from "@/components/admin/orders-tab"
import { AnalyticsTab } from "@/components/admin/analytics-tab"
import { CouponsTab } from "@/components/admin/coupons-tab"
import { AdminProfileTab } from "@/components/admin/admin-profile-tab"
import { Shield } from "lucide-react"

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    redirect("/")
  }

  // ✅ Cliente Supabase del lado del servidor
  const supabase = await getServerSupabase()

  // ✅ Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ✅ Obtener perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  // ✅ Consultas paralelas para estadísticas
  const [usersResult, ordersResult, revenueResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
  ])

  const totalUsers = usersResult.count || 0
  const totalOrders = ordersResult.count || 0
  const totalRevenue =
    revenueResult.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Panel de Administración</h1>
        </div>
        <p className="text-muted-foreground">Gestiona tu tienda de suplementos</p>
      </div>

      {/* ✅ Resumen general */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Usuarios</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Pedidos</CardDescription>
            <CardTitle className="text-3xl">{totalOrders}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ingresos Totales</CardDescription>
            <CardTitle className="text-3xl">
              ${totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* ✅ Pestañas del panel admin */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="coupons">Cupones</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponsTab />
        </TabsContent>

        <TabsContent value="profile">
          <AdminProfileTab user={user} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
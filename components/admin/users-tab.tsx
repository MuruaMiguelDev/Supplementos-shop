import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DeleteUserButton } from "./delete-user-button"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export async function UsersTab() {
  const supabase = await createServerClient()

  const { data: users } = await supabase
    .from("profiles")
    .select("*, referrals!referrals_referee_id_fkey(referrer_id)")
    .order("created_at", { ascending: false })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>Visualiza y administra todas las cuentas de usuario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Código de Referido</TableHead>
                <TableHead>Referido Por</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{user.referral_code}</code>
                  </TableCell>
                  <TableCell>{user.referred_by || "-"}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Usuario</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: es })}
                  </TableCell>
                  <TableCell>
                    {!user.is_admin && <DeleteUserButton userId={user.id} userName={user.full_name || user.email} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSetup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Error al configurar el administrador",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuración de Administrador</CardTitle>
          <CardDescription>Crea la cuenta de administrador para acceder al panel de gestión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong> Admin@supple.com
            </p>
            <p>
              <strong>Contraseña:</strong> Admin123
            </p>
            <p className="text-muted-foreground">Esta cuenta tendrá acceso completo al panel de administración.</p>
          </div>

          <Button onClick={handleSetup} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              "Crear Cuenta de Administrador"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {result?.success && (
            <div className="text-sm text-center space-y-2">
              <p className="text-muted-foreground">
                Ahora puedes iniciar sesión con las credenciales de administrador.
              </p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <a href="/auth/login">Ir al Login</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

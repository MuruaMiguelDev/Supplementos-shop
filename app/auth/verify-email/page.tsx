import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[600px] w-full items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verifica tu Email</CardTitle>
              <CardDescription>Te hemos enviado un correo de confirmación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Si no ves el correo, revisa tu carpeta de spam.
              </p>
              <div className="pt-4">
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/">Volver al inicio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

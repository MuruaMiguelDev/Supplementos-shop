"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Package, Home } from "lucide-react"

export default function OrderConfirmedPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
              <CheckCircle className="size-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">¡Pedido Confirmado!</h1>
          <p className="text-lg text-muted-foreground mb-2">Tu pedido ha sido procesado exitosamente</p>
          <p className="text-muted-foreground mb-8">
            Recibirás un correo electrónico con los detalles de tu pedido y el número de seguimiento
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">¿Qué sigue?</h2>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Prepararemos tu pedido en las próximas 24 horas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Recibirás un email con el número de seguimiento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>El tiempo de entrega estimado es de 3-5 días hábiles</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/productos">Seguir Comprando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

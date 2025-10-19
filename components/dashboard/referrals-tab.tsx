"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Copy, Check, Share2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface ReferralsTabProps {
  referralCode: string
  referrals: any[]
}

export function ReferralsTab({ referralCode, referrals }: ReferralsTabProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const { toast } = useToast()

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?ref=${referralCode}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    toast({
      title: "Código copiado",
      description: "Tu código de referido ha sido copiado",
    })
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    toast({
      title: "Enlace copiado",
      description: "El enlace de referido ha sido copiado",
    })
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a nuestra tienda",
          text: `Usa mi código ${referralCode} y obtén 15% de descuento en tu primera compra`,
          url: referralLink,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink()
    }
  }

  console.log("[v0] Referrals in component:", referrals)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle>Programa de Referidos</CardTitle>
              <CardDescription>Comparte tu código y gana descuentos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-primary/5 p-6">
            <h3 className="font-semibold mb-2">¿Cómo funciona?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Comparte tu código de referido con amigos y familiares</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Ellos obtienen 15% de descuento en su primera compra</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Tú recibes un cupón de 10% de descuento por cada referido</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tu Código de Referido</Label>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="font-mono text-lg" />
                <Button onClick={handleCopyCode} variant="outline" className="shrink-0 bg-transparent">
                  {copiedCode ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enlace de Referido</Label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="text-sm" />
                <Button onClick={handleCopyLink} variant="outline" className="shrink-0 bg-transparent">
                  {copiedLink ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={handleShare} className="w-full">
              <Share2 className="mr-2 size-4" />
              Compartir Código
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis Referidos ({referrals.length})</CardTitle>
          <CardDescription>Personas que se han registrado con tu código</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Aún no has referido a nadie</p>
              <p className="text-sm mt-1">Comparte tu código para empezar a ganar descuentos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{referral.referee?.full_name || "Usuario"}</p>
                    <p className="text-sm text-muted-foreground">
                      Registrado el{" "}
                      {new Date(referral.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                    {referral.status === "completed" ? "Completado" : "Pendiente"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

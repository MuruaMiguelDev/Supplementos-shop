"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // ✅ Pre-cargar código de referido desde la URL
  useEffect(() => {
    const refCode = (searchParams.get("ref") || "").trim().toUpperCase()
    if (refCode) setReferralCode(refCode)
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = fullName.trim()
    const emailTrim = email.trim()

    if (!name) {
      toast({ title: "Error", description: "Ingresa tu nombre completo", variant: "destructive" })
      return
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // (Opcional) Validar código de referido si está presente
      let referredBy: string | null = null
      if (referralCode) {
        try {
          const { data: referrerProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .single()

          if (referrerProfile?.id) {
            referredBy = referrerProfile.id
          } else {
            toast({
              title: "Código de referido inválido",
              description: "El código no existe. Continuaremos sin referido.",
              variant: "destructive",
            })
          }
        } catch {
          // Si RLS impide leer, continuamos sin referido
          toast({
            title: "No se pudo validar el referido",
            description: "Continuaremos sin referido.",
            variant: "destructive",
          })
        }
      }

      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${window.location.origin}/dashboard`

      const { error } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: name,
            referred_by: referredBy,
          },
        },
      })

      if (error) throw error

      toast({
        title: "Cuenta creada",
        description: "Revisa tu email para confirmar tu cuenta",
      })

      router.push("/auth/verify-email")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear la cuenta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[600px] w-full items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>Regístrate para comenzar a comprar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Código de Referido (Opcional)</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="ABC12345"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si tienes un código de referido, obtendrás un 15% de descuento en tu primera compra.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>

                <div className="text-center text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Inicia sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
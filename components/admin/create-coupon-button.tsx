"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function CreateCouponButton() {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createBrowserClient()

    try {
      const couponData = {
        code: formData.get("code") as string,
        discount_type: formData.get("discount_type") as string,
        discount_value: Number(formData.get("discount_value")),
        min_purchase: formData.get("min_purchase") ? Number(formData.get("min_purchase")) : null,
        max_uses: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
        expires_at: formData.get("valid_until") ? new Date(formData.get("valid_until") as string).toISOString() : null,
        is_active: true,
      }

      const { error } = await supabase.from("coupons").insert(couponData)

      if (error) throw error

      toast.success(`Cupón ${couponData.code} creado correctamente`)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating coupon:", error)
      toast.error("Error al crear cupón")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Cupón
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cupón</DialogTitle>
            <DialogDescription>Crea un nuevo cupón de descuento para tus clientes</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Código del Cupón</Label>
              <Input id="code" name="code" placeholder="VERANO2024" required className="uppercase" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount_type">Tipo de Descuento</Label>
              <Select name="discount_type" defaultValue="percentage" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed">Monto Fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount_value">Valor del Descuento</Label>
              <Input
                id="discount_value"
                name="discount_value"
                type="number"
                step="0.01"
                min="0"
                placeholder="10"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="min_purchase">Compra Mínima (opcional)</Label>
              <Input id="min_purchase" name="min_purchase" type="number" step="0.01" min="0" placeholder="50.00" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max_uses">Límite de Usos (opcional)</Label>
              <Input id="max_uses" name="max_uses" type="number" min="1" placeholder="100" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="valid_until">Válido Hasta (opcional)</Label>
              <Input id="valid_until" name="valid_until" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Cupón"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

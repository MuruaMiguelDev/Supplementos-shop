// components/admin/products-import-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function ProductsImportTab() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<null | {created:number;updated:number;errors:string[] }>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!file) return
    setIsLoading(true)
    setError(null)
    setResult(null)
    setProgress(10)

    const data = new FormData()
    data.append("file", file)

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: data,
      })
      setProgress(80)

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Error al importar productos")
      }

      const json = await res.json()
      setProgress(100)
      setResult(json)
    } catch (e: any) {
      setError(e?.message || "Error inesperado")
    } finally {
      setIsLoading(false)
      setTimeout(() => setProgress(0), 1500)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar productos (CSV o XLSX)</CardTitle>
          <CardDescription>
            Use <code>slug</code> o <code>id</code> como clave para crear/actualizar. 
            Arrays permitidos como JSON (<code>["a","b"]</code>) o coma-separado (<code>a,b</code>).
          </CardDescription>
        </CardHeader>
        <div className="p-6 flex flex-col gap-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={!file || isLoading}>
              {isLoading ? "Procesando..." : "Subir y procesar"}
            </Button>
            <a
              className="underline text-sm text-muted-foreground"
              href="/api/admin/products/template"
              target="_blank"
            >
              Descargar plantilla CSV
            </a>
          </div>
          {isLoading && <Progress value={progress} />}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="text-sm space-y-2">
              <p>✅ Creados: <b>{result.created}</b></p>
              <p>♻️ Actualizados: <b>{result.updated}</b></p>
              {result.errors?.length > 0 && (
                <details className="mt-2">
                  <summary>Errores ({result.errors.length})</summary>
                  <ul className="list-disc pl-5">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
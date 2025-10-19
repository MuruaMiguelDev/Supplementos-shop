import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Suplementos Deportivos | Tu Tienda de Nutrición Deportiva",
  description:
    "Encuentra los mejores suplementos deportivos para alcanzar tus objetivos. Proteínas, creatina, pre-entrenos y más.",
  keywords: "suplementos deportivos, proteína, creatina, pre-entreno, nutrición deportiva",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

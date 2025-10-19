"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ShoppingCart, Heart, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchDropdown } from "@/components/search-dropdown"
import { useCartStore } from "@/src/lib/store/cart"
import { useFavoritesStore } from "@/src/lib/store/favorites"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@/lib/supabase/client"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const { items } = useCartStore()
  const { ids: favoriteIds } = useFavoritesStore()

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsAuthenticated(!!user)
    }

    checkAuth()

    const supabase = createBrowserClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "/blog", label: "Blog" },
    { href: "/contacto", label: "Contacto" },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60" : "bg-background",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">SupleMax</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-foreground/60",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <SearchDropdown />

            <ThemeToggle />

            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/favoritos">
                <Heart className="size-5" />
                {favoriteIds.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
                  >
                    {favoriteIds.length}
                  </Badge>
                )}
                <span className="sr-only">Favoritos</span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/carrito">
                <ShoppingCart className="size-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
                <span className="sr-only">Carrito</span>
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <User className="size-5" />
                  <span className="sr-only">Mi cuenta</span>
                </Link>
              </Button>
            ) : (
              <Button variant="default" size="sm" asChild className="hidden sm:flex">
                <Link href="/auth/login">Ingresar</Link>
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-foreground/60",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                      <Link href="/auth/login">Ingresar</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

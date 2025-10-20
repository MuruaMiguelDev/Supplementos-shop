import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl">SupleMax</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza para suplementos deportivos de alta calidad.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="size-5" />
                  <span className="sr-only">Facebook</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="size-5" />
                  <span className="sr-only">Instagram</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="size-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <Youtube className="size-5" />
                  <span className="sr-only">YouTube</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Tienda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos?categoria=proteinas" className="text-muted-foreground hover:text-primary">
                  Proteínas
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=pre-entreno" className="text-muted-foreground hover:text-primary">
                  Pre-Entrenos
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=creatina" className="text-muted-foreground hover:text-primary">
                  Creatina
                </Link>
              </li>
              <li>
                <Link href="/productos?categoria=vitaminas" className="text-muted-foreground hover:text-primary">
                  Vitaminas
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-muted-foreground hover:text-primary">
                  Ver Todos
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-primary">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/envios" className="text-muted-foreground hover:text-primary">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="text-muted-foreground hover:text-primary">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-muted-foreground hover:text-primary">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suscríbete para recibir ofertas exclusivas y novedades.
            </p>
            <form className="space-y-2">
              <Input type="email" placeholder="tu@email.com" />
              <Button type="submit" className="w-full">
                Suscribirse
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SupleMax. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { formatCurrency } from "@/src/lib/utils/currency"
import { ArrowRight, Star, Zap, Shield, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  let products = []
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("is_featured", { ascending: false })
      .limit(6)

    if (!error && data) {
      products = data.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        description: p.description,
        price: Number(p.price),
        compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
        image: p.image,
        images: p.image ? [p.image] : [],
        category: p.category,
        rating: p.rating ? Number(p.rating) : undefined,
        reviewsCount: p.reviews_count || 0,
        stock: p.stock || 0,
        inStock: (p.stock || 0) > 0,
      }))
    }
  } catch (error) {
    console.error("[v0] Error fetching featured products:", error)
  }

  return (
    <main className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Carousel className="w-full max-w-5xl mx-auto" opts={{ loop: true }}>
            <CarouselContent>
              <CarouselItem>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <Badge className="w-fit">Nuevo Lanzamiento</Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">Potencia Tu Rendimiento</h1>
                    <p className="text-lg text-muted-foreground text-pretty">
                      Descubre nuestra línea premium de suplementos deportivos diseñados para atletas de élite.
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" asChild>
                        <Link href="/productos">
                          Explorar Productos <ArrowRight />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/sobre-nosotros">Conocer Más</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-[400px] rounded-2xl overflow-hidden">
                    <Image
                      src="/protein-powder-chocolate.jpg"
                      alt="Proteína Premium"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <Badge variant="secondary" className="w-fit">
                      Más Vendido
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">Energía Sin Límites</h1>
                    <p className="text-lg text-muted-foreground text-pretty">
                      Pre-entrenos formulados científicamente para maximizar tu energía y concentración.
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" asChild>
                        <Link href="/productos?categoria=pre-entreno">
                          Ver Pre-Entrenos <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-[400px] rounded-2xl overflow-hidden">
                    <Image src="/pre-workout-powder-tropical.jpg" alt="Pre-Entreno" fill className="object-cover" />
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <Badge variant="outline" className="w-fit">
                      100% Natural
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance">Opciones Veganas</h1>
                    <p className="text-lg text-muted-foreground text-pretty">
                      Proteínas vegetales orgánicas de la más alta calidad para tu estilo de vida saludable.
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" asChild>
                        <Link href="/productos?categoria=proteinas">
                          Ver Proteínas <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative h-[400px] rounded-2xl overflow-hidden">
                    <Image src="/vegan-protein-powder-chocolate.jpg" alt="Proteína Vegana" fill className="object-cover" />
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Zap className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Resultados Rápidos</h3>
                <p className="text-sm text-muted-foreground">Fórmulas efectivas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Calidad Garantizada</h3>
                <p className="text-sm text-muted-foreground">Certificados y probados</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Truck className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Envío Gratis</h3>
                <p className="text-sm text-muted-foreground">En pedidos +$50</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Star className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">5 Estrellas</h3>
                <p className="text-sm text-muted-foreground">Miles de reseñas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Productos Destacados</h2>
              <p className="text-muted-foreground">Los favoritos de nuestros clientes</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/productos">
                Ver Todos <ArrowRight />
              </Link>
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/productos/${product.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative h-64 w-full overflow-hidden rounded-t-xl">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=256&width=256"}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {product.compareAtPrice && (
                          <Badge className="absolute top-4 right-4" variant="destructive">
                            Oferta
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {product.brand && <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>}
                      <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                      {product.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-4 ${
                                  i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({product.reviewsCount})</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <div>
                        {product.compareAtPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </p>
                        )}
                        <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                      </div>
                      <Button>Agregar</Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay productos destacados disponibles</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            ¿Listo Para Transformar Tu Entrenamiento?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Únete a miles de atletas que confían en nuestros suplementos para alcanzar sus objetivos.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/productos">Comprar Ahora</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/blog">Leer Blog</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

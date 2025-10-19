import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Users, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre SupleMax</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Tu aliado de confianza en suplementos deportivos de alta calidad. Comprometidos con tu salud y rendimiento
          desde 2020.
        </p>
      </section>

      {/* Mission Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative h-[400px] rounded-2xl overflow-hidden">
          <Image src="/gym-equipment-and-supplements.jpg" alt="Nuestra misión" fill className="object-cover" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Nuestra Misión</h2>
          <p className="text-muted-foreground text-lg">
            En SupleMax, nos dedicamos a proporcionar suplementos deportivos de la más alta calidad para ayudarte a
            alcanzar tus objetivos de fitness y bienestar. Creemos que cada persona merece acceso a productos premium
            que realmente funcionen.
          </p>
          <p className="text-muted-foreground text-lg">
            Trabajamos directamente con los mejores fabricantes del mundo para garantizar que cada producto cumpla con
            nuestros estrictos estándares de calidad y efectividad.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Nuestros Valores</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Shield className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Calidad Garantizada</h3>
              <p className="text-sm text-muted-foreground">
                Todos nuestros productos están certificados y probados en laboratorios independientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Award className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Excelencia</h3>
              <p className="text-sm text-muted-foreground">
                Nos esforzamos por ofrecer solo los mejores productos del mercado.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Users className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Comunidad</h3>
              <p className="text-sm text-muted-foreground">
                Construimos una comunidad de atletas y entusiastas del fitness.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Heart className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Pasión</h3>
              <p className="text-sm text-muted-foreground">
                Amamos lo que hacemos y nos apasiona ayudarte a alcanzar tus metas.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground rounded-2xl p-12 mb-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-bold mb-2">10,000+</p>
            <p className="text-primary-foreground/90">Clientes Satisfechos</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">500+</p>
            <p className="text-primary-foreground/90">Productos Premium</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">4.8★</p>
            <p className="text-primary-foreground/90">Calificación Promedio</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Explora nuestra amplia selección de suplementos y encuentra los productos perfectos para tus objetivos.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/productos">Ver Productos</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contacto">Contáctanos</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

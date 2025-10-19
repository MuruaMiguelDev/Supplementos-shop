"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import { getBlogPostBySlug } from "@/src/lib/api/blog"
import type { BlogPost } from "@/types/blog"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPost() {
      try {
        const slug = params.slug as string
        const data = await getBlogPostBySlug(slug)
        if (!data) {
          router.push("/blog")
          return
        }
        setPost(data)
      } catch (error) {
        console.error("Error loading blog post:", error)
        router.push("/blog")
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [params.slug, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8" />
          <div className="h-12 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          <div className="h-96 bg-muted rounded mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Enlace copiado al portapapeles")
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="size-4 mr-2" />
              Volver al Blog
            </Button>
          </Link>

          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{post.title}</h1>
            <p className="text-xl text-muted-foreground text-pretty">{post.excerpt}</p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.author.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>
                      {post.publishedAt.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>{post.readTime} min de lectura</span>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="size-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
          <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
        </div>

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div className="whitespace-pre-line leading-relaxed">{post.content}</div>
        </article>

        <Separator className="my-8" />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Image
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h3 className="font-semibold text-lg mb-2">Sobre el autor</h3>
                <p className="text-muted-foreground mb-3">
                  {post.author.name} es un experto en nutrición deportiva con años de experiencia ayudando a atletas y
                  entusiastas del fitness a alcanzar sus objetivos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button variant="outline" size="lg">
              <ArrowLeft className="size-4 mr-2" />
              Ver más artículos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

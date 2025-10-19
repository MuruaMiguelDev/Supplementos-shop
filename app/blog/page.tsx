"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"
import { listBlogPosts } from "@/src/lib/api/blog"
import type { BlogPost } from "@/types/blog"

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await listBlogPosts(1, 9)
        setPosts(data.posts)
      } catch (error) {
        console.error("Error loading blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog de Nutrición Deportiva</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Artículos, guías y consejos de expertos para optimizar tu rendimiento
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-full animate-pulse">
              <CardHeader className="p-0">
                <div className="h-48 w-full bg-muted rounded-t-xl" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog de Nutrición Deportiva</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Artículos, guías y consejos de expertos para optimizar tu rendimiento
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={post.coverImage || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-xs">{post.author.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span className="text-xs">
                      {post.publishedAt.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span className="text-xs">{post.readTime} min</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

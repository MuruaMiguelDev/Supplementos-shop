export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: Date
  tags?: string[]
  readTime: number
}

export interface PaginatedBlogPosts {
  posts: BlogPost[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

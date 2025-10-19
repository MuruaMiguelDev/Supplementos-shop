import { createServerClient as createServerClientSSR } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Create a Supabase client for server-side operations
 * IMPORTANT: Don't put this client in a global variable
 * Always create a new client within each function
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[v0] Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your project settings.",
    )

    const createChainableMock = () => {
      const mockResult = { data: [], error: null }
      const chain: any = {
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        delete: () => chain,
        eq: () => chain,
        neq: () => chain,
        gt: () => chain,
        gte: () => chain,
        lt: () => chain,
        lte: () => chain,
        like: () => chain,
        ilike: () => chain,
        is: () => chain,
        in: () => chain,
        contains: () => chain,
        containedBy: () => chain,
        rangeGt: () => chain,
        rangeGte: () => chain,
        rangeLt: () => chain,
        rangeLte: () => chain,
        rangeAdjacent: () => chain,
        overlaps: () => chain,
        textSearch: () => chain,
        match: () => chain,
        not: () => chain,
        or: () => chain,
        filter: () => chain,
        order: () => chain,
        limit: () => chain,
        range: () => chain,
        single: () => ({ ...mockResult, data: null }),
        maybeSingle: () => ({ ...mockResult, data: null }),
        then: (resolve: any) => resolve(mockResult),
        ...mockResult,
      }
      return chain
    }

    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => createChainableMock(),
    } as any
  }

  const cookieStore = await cookies()

  return createServerClientSSR(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}

// Keep the old export for backward compatibility
export async function createClient() {
  return createServerClient()
}

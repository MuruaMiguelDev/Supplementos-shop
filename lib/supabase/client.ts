import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {

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
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => createChainableMock(),
    } as any
  }

  return createBrowserClientSSR(supabaseUrl, supabaseAnonKey)
}

// Keep the old export for backward compatibility
export function createClient() {
  return createBrowserClient()
}

// lib/supabase/server.ts
import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getServerSupabase() {
  const cookieStore = await cookies(); // 👈 ahora es async

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options?: any) {
          // Next 15 usa firma (name, value, options)
          try {
            
            cookieStore.set(name, value, options);
          } catch {
            // Compatibilidad con Next 14 (objeto)
            
            cookieStore.set({ name, value, ...options });
          }
        },
        remove(name: string, options?: any) {
          try {
            // Next 15
            // @ts-expect-error múltiples firmas según versión
            cookieStore.delete(name, options);
          } catch {
            // Next 14 (objeto)
            
            cookieStore.delete({ name, ...options });
          }
        },
      },
    }
  );

  return supabase;
}
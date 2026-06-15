import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createNoOpServerClient() {
  const noop = async () => ({ data: null, error: null })
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: noop,
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: noop, order: noop }), order: noop }),
      insert: noop,
      update: noop,
      delete: noop,
    }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
    removeChannel: () => {},
  } as any
}

export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return createNoOpServerClient()

  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies cannot be set here
          }
        },
      },
    }
  )
}

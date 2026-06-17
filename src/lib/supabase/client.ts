import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Return a no-op stub when Supabase env vars are not configured (design/test mode)
function createNoOpClient() {
  const result = Promise.resolve({ data: null, error: null })
  // A self-referential query builder so any chain of .select().eq().order()
  // etc. resolves to an empty result and is awaitable / thenable.
  const builder: any = {
    select: () => builder,
    insert: () => result,
    update: () => builder,
    upsert: () => result,
    delete: () => builder,
    eq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => result,
    maybeSingle: () => result,
    then: (...args: any[]) => result.then(...args),
  }
  return {
    auth: {
      signInWithPassword: () => result,
      signOut: () => result,
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => builder,
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
    removeChannel: () => {},
  } as any
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return createNoOpClient()
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}

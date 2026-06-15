import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Return a no-op stub when Supabase env vars are not configured (design/test mode)
function createNoOpClient() {
  const noop = () => Promise.resolve({ data: null, error: null })
  return {
    auth: {
      signInWithPassword: noop,
      signOut: noop,
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
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

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return createNoOpClient()
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}

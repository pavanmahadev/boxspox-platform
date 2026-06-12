import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createDummyClient() {
  const chainable: any = new Proxy({
    data: [] as any,
    error: null as any,
    count: 0 as any
  }, {
    get(target: any, prop: any) {
      if (prop === 'then') return undefined;
      if (prop in target) return target[prop];
      return () => chainable;
    }
  });

  return {
    from: () => chainable,
    rpc: () => chainable,
    auth: new Proxy({
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
      signOut: async () => ({ error: null }),
      admin: new Proxy({}, {
        get() {
          return async () => ({ data: {}, error: null });
        }
      }) as any
    }, {
      get(target: any, prop: any) {
        if (prop in target) return target[prop];
        return async () => ({ data: {}, error: null });
      }
    }) as any,
    channel: () => ({
      send: async () => ({}),
      subscribe: () => ({}),
      on: () => ({})
    }),
    removeChannel: async () => ({})
  };
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Supabase environment variables are MISSING on server! Returning dummy client.");
    return createDummyClient();
  }

  const cookieStore = await cookies()

  return createServerClient(
    url,
    key,
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

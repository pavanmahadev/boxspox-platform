import { createClient } from '@supabase/supabase-js';

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

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are MISSING for admin client! Returning dummy client.");
    return createDummyClient();
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

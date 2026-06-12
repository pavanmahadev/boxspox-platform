import { createBrowserClient } from '@supabase/ssr'

let client: any = null;

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

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Supabase environment variables are MISSING! Returning dummy client.");
    return createDummyClient();
  }

  console.log("Supabase client initialized with URL:", url.substring(0, 10) + "...");

  client = createBrowserClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: { 'x-application-name': 'pandaschool' },
      },
    }
  );

  // Silently handle lock errors which can occur in multi-tab environments
  if (typeof window !== 'undefined') {
    // 1. Suppress console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const msg = args.join(' ');
      if (msg.includes('Lock broken') || msg.includes('AbortError')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // 2. Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const msg = event.reason?.message || "";
      const name = event.reason?.name || "";
      if (msg.includes('Lock broken') || name === 'AbortError') {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }
  
  return client;
}

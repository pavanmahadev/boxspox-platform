import { createClient } from '@supabase/supabase-js';

function createDummyClient() {
  const dummy: any = new Proxy(() => {}, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: null, error: null });
      }
      return dummy;
    },
    apply(target, thisArg, argumentsList) {
      return dummy;
    }
  });
  return dummy;
}

export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are MISSING for public client! Returning dummy client.");
    return createDummyClient();
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

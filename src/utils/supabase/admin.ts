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

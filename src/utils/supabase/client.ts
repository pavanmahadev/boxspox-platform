import { createBrowserClient } from '@supabase/ssr'

let client: any = null;

export function createClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
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

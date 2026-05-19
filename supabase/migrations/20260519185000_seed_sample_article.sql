-- Seed a premium sample tech article
INSERT INTO public.articles (
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  category_name,
  tags,
  status,
  read_time_minutes,
  published_at
) VALUES (
  'Building Highly Scalable Web Applications with Next.js 15 & Supabase',
  'building-scalable-web-apps-nextjs-supabase',
  'Learn the architectural best practices for scaling modern React/Next.js frontend applications backed by Supabase postgres instances.',
  '# Building Highly Scalable Web Applications with Next.js 15 & Supabase

Modern web applications require high availability, low latency, and quick iteration cycles. In this article, we explore the architectural design patterns to scale your Next.js application with Supabase.

## The Architecture

A typical scalable setup involves:
1. **Next.js Frontend:** Deployed on Vercel/similar Edge platform.
2. **Supabase Postgres:** Configured with proper indexes, connection pooling, and caching.
3. **Database RLS:** Guaranteeing security directly at the API layer.

### 1. Connection Pooling with Supabase
Always configure connection pooling when utilizing Serverless Functions (like Vercel functions). Supabase provides built-in PgBouncer/Supavisor integrations.

```javascript
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

### 2. Row Level Security (RLS)
Make sure RLS is enabled on all tables:
> **Security First:** Never expose tables without explicitly defining policies.

Stay tuned for more updates!
',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
  '💻 Technology',
  ARRAY['nextjs', 'supabase', 'scaling', 'architecture'],
  'published',
  8,
  timezone('utc'::text, now())
) ON CONFLICT (slug) DO NOTHING;

-- Articles/Blog CMS Table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT, -- Markdown content
  excerpt TEXT, -- Short summary
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT, -- Denormalized for display
  category_name TEXT, -- e.g. "💻 Technology"
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- draft, published, archived
  read_time_minutes INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles
  FOR SELECT USING (status = 'published');

-- Admins and instructors can do everything
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;
CREATE POLICY "Admins can manage all articles" ON public.articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

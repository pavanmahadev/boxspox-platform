-- Boxspox EdTech Platform Expansion Migration
-- Adds scalable category architecture, quizzes, assignments, and certificates

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update Courses Table
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category_name TEXT, -- Optional denormalization
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
ADD COLUMN IF NOT EXISTS duration TEXT, -- e.g., "4 weeks"
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- draft, published, archived

-- 3. Update Lessons Table (to support multi-domain content)
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text', -- 'video', 'text', 'interactive_code', 'pdf'
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 10; -- minutes

-- 4. Create Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- e.g., ["A", "B", "C", "D"]
  correct_option_index INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Quiz Attempts Table (for Student Progress)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  certificate_url TEXT NOT NULL,
  verify_code TEXT UNIQUE NOT NULL
);

-- Enable RLS for New Tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert their own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can verify certificates" ON public.certificates;
CREATE POLICY "Public can verify certificates" ON public.certificates FOR SELECT USING (true);

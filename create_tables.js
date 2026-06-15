require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL: https://quuijrncbrafpygpubmw.supabase.co
const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];
console.log('Project ref:', projectRef);

const sql = `
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70 NOT NULL,
  time_limit_minutes INTEGER DEFAULT 60 NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' NOT NULL,
  options JSONB DEFAULT '[]'::jsonb NOT NULL,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1 NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  score NUMERIC,
  passed BOOLEAN,
  answers JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published exams are viewable by everyone" ON public.exams;
DROP POLICY IF EXISTS "Users can view and manage their own exams" ON public.exams;
CREATE POLICY "Published exams are viewable by everyone" ON public.exams FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view and manage their own exams" ON public.exams FOR ALL USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Questions for published exams are viewable by everyone" ON public.exam_questions;
DROP POLICY IF EXISTS "Users can manage questions for their exams" ON public.exam_questions;
CREATE POLICY "Questions for published exams are viewable by everyone" ON public.exam_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND exams.is_published = true)
);
CREATE POLICY "Users can manage questions for their exams" ON public.exam_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND exams.created_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.exam_submissions;
CREATE POLICY "Users can view their own submissions" ON public.exam_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own submissions" ON public.exam_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.exam_submissions FOR UPDATE USING (auth.uid() = user_id);
`;

async function run() {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text.slice(0, 500));

  if (response.ok) {
    console.log('\n✅ Tables created successfully!');
    // Verify
    const { createClient } = require('@supabase/supabase-js');
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await admin.from('exams').select('count').limit(1);
    console.log('Verification:', error ? '❌ Still missing: ' + error.message : '✅ exams table is now accessible!');
  } else {
    console.log('\n❌ API failed, trying alternative endpoint...');
    
    // Try Supabase Management REST API
    const r2 = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });
    const t2 = await r2.text();
    console.log('Alt Status:', r2.status, t2.slice(0, 300));
  }
}

run().catch(console.error);

const { Client } = require('pg');

const client = new Client({
  host: 'db.quuijrncbrafpygpubmw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Pavan9901@#',
  ssl: { rejectUnauthorized: false }
});

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
  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!');
    
    await client.query(sql);
    console.log('✅ Migration applied!');
    
    const res = await client.query('SELECT COUNT(*) FROM public.exams');
    console.log('✅ exams table exists, rows:', res.rows[0].count);
    const res2 = await client.query('SELECT COUNT(*) FROM public.exam_questions');
    console.log('✅ exam_questions table exists, rows:', res2.rows[0].count);
    const res3 = await client.query('SELECT COUNT(*) FROM public.exam_submissions');
    console.log('✅ exam_submissions table exists, rows:', res3.rows[0].count);
    console.log('\n🎉 All done! Exam saving should work now.');
  } catch(e) {
    console.error('❌ Error:', e.message);
  } finally {
    await client.end();
  }
}

run();

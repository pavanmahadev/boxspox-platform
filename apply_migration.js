const https = require('https');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `
-- Create Exams Table (safe, skip if exists)
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  passing_score INTEGER DEFAULT 70 NOT NULL,
  time_limit_minutes INTEGER DEFAULT 60 NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Exam Questions Table
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

-- Create Exam Submissions Table
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

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Published exams are viewable by everyone" ON public.exams;
DROP POLICY IF EXISTS "Users can view and manage their own exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can manage all exams" ON public.exams;

CREATE POLICY "Published exams are viewable by everyone" ON public.exams FOR SELECT USING (is_published = true);
CREATE POLICY "Users can view and manage their own exams" ON public.exams FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all exams" ON public.exams FOR ALL USING (
  ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin')
);

-- RLS Policies for exam_questions
DROP POLICY IF EXISTS "Questions for published exams are viewable by everyone" ON public.exam_questions;
DROP POLICY IF EXISTS "Users can manage questions for their exams" ON public.exam_questions;

CREATE POLICY "Questions for published exams are viewable by everyone" ON public.exam_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND exams.is_published = true)
);
CREATE POLICY "Users can manage questions for their exams" ON public.exam_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND (exams.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')))
);

-- RLS Policies for exam_submissions
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Instructors can view submissions for their exams" ON public.exam_submissions;

CREATE POLICY "Users can view their own submissions" ON public.exam_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own submissions" ON public.exam_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.exam_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Instructors can view submissions for their exams" ON public.exam_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_submissions.exam_id AND (exams.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')))
);
`;

const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
// Use the pg endpoint instead
const pgUrl = `${SUPABASE_URL}/pg/query`;

// Use fetch via node-fetch approach
const body = JSON.stringify({ query: sql });

const urlObj = new URL(`${SUPABASE_URL}/rest/v1/`);
const host = urlObj.hostname;

const options = {
  hostname: host,
  port: 443,
  path: '/pg/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'apikey': SERVICE_ROLE_KEY,
    'Content-Length': Buffer.byteLength(body)
  }
};

// Try using supabase-js admin client to execute raw SQL via rpc
const { createClient } = require('@supabase/supabase-js');
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applyMigration() {
  console.log('Connecting to:', SUPABASE_URL);
  
  // Split by semicolons and run each statement
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 1);
  
  for (const stmt of statements) {
    const { error } = await admin.rpc('exec_sql', { sql_query: stmt });
    if (error && !error.message?.includes('does not exist')) {
      // Try direct query approach
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ sql_query: stmt })
      });
      if (!res.ok) {
        const err = await res.text();
        console.warn('Statement warning (may be ok):', err.slice(0, 100));
      }
    }
  }
  
  // Verify tables were created
  const { data, error } = await admin.from('exams').select('id').limit(1);
  if (error) {
    console.error('❌ Tables still missing:', error.message);
    console.log('\nPlease manually run the SQL in your Supabase Dashboard SQL Editor.');
  } else {
    console.log('✅ exams table is accessible! Exams found:', data?.length || 0);
  }
}

applyMigration().catch(console.error);

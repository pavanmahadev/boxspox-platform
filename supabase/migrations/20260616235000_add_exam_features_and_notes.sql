-- Add warnings_count to exam submissions
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS warnings_count INTEGER DEFAULT 0 NOT NULL;

-- Create student_notes table
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutorial_slug TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for student_notes
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- Policy
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.student_notes;
CREATE POLICY "Users can manage their own notes" ON public.student_notes FOR ALL USING (auth.uid() = user_id);

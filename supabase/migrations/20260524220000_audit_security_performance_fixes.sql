-- =====================================================
-- Pandaschool Platform Audit Fixes Migration
-- Date: 2026-05-24
-- =====================================================

-- =====================================================
-- FIX 1: Revoke EXECUTE from anon on SECURITY DEFINER functions
-- =====================================================
REVOKE EXECUTE ON FUNCTION public.award_xp_if_eligible(uuid, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_course_completion() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_registrations(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_lesson_complete() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_profile_update() FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_article_views(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_course_changes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_lesson_engagement(uuid) FROM anon;

-- =====================================================
-- FIX 2: Fix activity_logs - remove overly broad public SELECT policy
-- =====================================================
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;

-- =====================================================
-- FIX 3: Add SET search_path to all vulnerable functions
-- =====================================================
ALTER FUNCTION public.get_lesson_engagement(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.handle_new_user() SET search_path = public, extensions;
ALTER FUNCTION public.handle_profile_update() SET search_path = public, extensions;
ALTER FUNCTION public.get_daily_registrations(integer) SET search_path = public, extensions;
ALTER FUNCTION public.award_xp_if_eligible(uuid, integer, text) SET search_path = public, extensions;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions;
ALTER FUNCTION public.increment_article_views(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.log_course_changes() SET search_path = public, extensions;
ALTER FUNCTION public.check_course_completion() SET search_path = public, extensions;
ALTER FUNCTION public.handle_lesson_complete() SET search_path = public, extensions;
ALTER FUNCTION public.rls_auto_enable() SET search_path = public, extensions;

-- =====================================================
-- FIX 4: Create 25 missing FK indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_parent_id ON public.discussion_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_user_id ON public.discussion_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON public.lesson_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_path_courses_course_id ON public.path_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_path_courses_path_id ON public.path_courses(path_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON public.project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_course_id ON public.wishlists(course_id);

-- =====================================================
-- FIX 5: Fix RLS auth.uid() re-evaluation (wrap in SELECT)
-- =====================================================

-- user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_progress;

CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own progress" ON public.user_progress
  FOR DELETE USING ((select auth.uid()) = user_id);

-- enrollments
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON public.enrollments;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own enrollments" ON public.enrollments
  FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((select auth.uid()) = id);

-- quiz_attempts (deduplicated)
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON public.quiz_attempts;

CREATE POLICY "Users can view their own attempts" ON public.quiz_attempts
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- certificates (deduplicated)
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert their own certificates" ON public.certificates;

CREATE POLICY "Users can view their own certificates" ON public.certificates
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own certificates" ON public.certificates
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- project_submissions
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.project_submissions;

CREATE POLICY "Users can view their own submissions" ON public.project_submissions
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own submissions" ON public.project_submissions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- FIX 6: Remove duplicate RLS policies
-- =====================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;
DROP POLICY IF EXISTS "Public read access for learning_paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Public read access for path_courses" ON public.path_courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
DROP POLICY IF EXISTS "Public quizzes are viewable by everyone" ON public.quizzes;
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;
DROP POLICY IF EXISTS "Quiz questions are viewable by authenticated users" ON public.quiz_questions;
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON public.modules;
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;

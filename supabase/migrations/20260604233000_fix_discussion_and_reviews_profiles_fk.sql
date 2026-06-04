-- =====================================================
-- Fix Foreign Key Constraints for PostgREST joins
-- Target: discussion_comments and course_reviews tables
-- Action: Redirect user_id FKs from auth.users(id) to public.profiles(id)
-- =====================================================

-- 1. Fix discussion_comments table profiles relationship
ALTER TABLE public.discussion_comments
  DROP CONSTRAINT IF EXISTS discussion_comments_user_id_fkey,
  ADD CONSTRAINT discussion_comments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 2. Fix course_reviews table profiles relationship
ALTER TABLE public.course_reviews
  DROP CONSTRAINT IF EXISTS course_reviews_user_id_fkey,
  ADD CONSTRAINT course_reviews_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

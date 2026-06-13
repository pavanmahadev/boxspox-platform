-- Fix for "infinite recursion detected in policy for relation 'profiles'"
-- This drops any recursive admin policies on profiles and replaces them with a JWT-based policy.

-- 1. Drop the problematic recursive policies (replace names if yours are different)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

-- 2. Create the fixed policies using the JWT app_metadata claim instead of querying the profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

CREATE POLICY "Admins can delete all profiles" ON public.profiles
  FOR DELETE 
  USING ((auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin');

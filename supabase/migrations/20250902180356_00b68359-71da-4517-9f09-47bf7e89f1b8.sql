-- Create a security definer function to check if current user is admin
-- This bypasses RLS policies to prevent infinite recursion issues
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- Drop existing policies on diaper_donations
DROP POLICY IF EXISTS "Only admins can view donation details" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can insert donations" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON public.diaper_donations;

-- Recreate policies using the security definer function
CREATE POLICY "Only admins can view donation details" 
ON public.diaper_donations 
FOR SELECT 
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Admins can insert donations" 
ON public.diaper_donations 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update donations" 
ON public.diaper_donations 
FOR UPDATE 
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Admins can delete donations" 
ON public.diaper_donations 
FOR DELETE 
TO authenticated
USING (public.is_current_user_admin());
-- Add super_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN super_admin boolean DEFAULT false;

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT super_admin FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- Create a view for user management (only accessible by super admins)
CREATE OR REPLACE VIEW public.user_management AS
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.is_admin,
  p.super_admin,
  p.created_at,
  -- Count baby profiles for this user
  (SELECT COUNT(*) FROM public.baby_info WHERE user_id = p.id) as baby_count,
  -- Check if user has any diaper data
  (SELECT COUNT(*) FROM public.diaper_age_groups WHERE user_id = p.id) as age_groups_count
FROM public.profiles p;

-- Create RLS policy for user_management view
ALTER VIEW public.user_management SET (security_barrier = true);
CREATE POLICY "Only super admins can view user management"
ON public.user_management
FOR SELECT
TO authenticated
USING (is_super_admin());

-- Create function to promote/demote admin status (only for super admins)
CREATE OR REPLACE FUNCTION public.update_user_admin_status(target_user_id uuid, new_admin_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can modify admin status';
  END IF;
  
  -- Cannot modify super admin status through this function
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND super_admin = true) THEN
    RAISE EXCEPTION 'Cannot modify super admin status through this function';
  END IF;
  
  UPDATE public.profiles 
  SET is_admin = new_admin_status,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;
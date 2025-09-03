-- Fix the create_user_admin function with proper pgcrypto usage
CREATE OR REPLACE FUNCTION public.create_user_admin(user_email text, user_password text, user_display_name text DEFAULT NULL::text, make_admin boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can create users';
  END IF;
  
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;
  
  -- Create user in auth.users with proper password hashing
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    extensions.crypt(user_password, extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;
  
  -- Create profile
  INSERT INTO public.profiles (id, display_name, email, is_admin)
  VALUES (
    new_user_id,
    COALESCE(user_display_name, split_part(user_email, '@', 1)),
    user_email,
    make_admin
  );
  
  -- Initialize user data if they're not an admin
  IF NOT make_admin THEN
    -- This will trigger the initialize_user_data function
    -- No need to manually create the data
  END IF;
  
  RETURN new_user_id;
END;
$function$;
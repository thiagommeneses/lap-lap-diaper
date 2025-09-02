-- Função para deletar usuário (somente super admin)
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can delete users';
  END IF;
  
  -- Cannot delete super admin users
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND super_admin = true) THEN
    RAISE EXCEPTION 'Cannot delete super admin users';
  END IF;
  
  -- Delete user data (cascading will handle related data)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$function$;

-- Função para atualizar dados do usuário (somente super admin)
CREATE OR REPLACE FUNCTION public.update_user_data(
  target_user_id uuid, 
  new_display_name text DEFAULT NULL,
  new_email text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can update user data';
  END IF;
  
  -- Update profile data
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(new_display_name, display_name),
    email = COALESCE(new_email, email),
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Update auth user email if provided
  IF new_email IS NOT NULL THEN
    UPDATE auth.users 
    SET email = new_email
    WHERE id = target_user_id;
  END IF;
END;
$function$;

-- Função para criar novo usuário (somente super admin)
CREATE OR REPLACE FUNCTION public.create_user_admin(
  user_email text,
  user_password text,
  user_display_name text DEFAULT NULL,
  make_admin boolean DEFAULT false
)
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
  
  -- Create user in auth.users
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
    crypt(user_password, gen_salt('bf')),
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
-- Atualizar o usuário atual para admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'thiago@pixmeyou.com.br';
-- Criar primeiro usuário administrador (você precisará fazer signup e depois executar este comando com o ID correto)
-- UPDATE public.profiles SET is_admin = true WHERE email = 'seu@email.com';

-- Habilitar realtime para as tabelas
ALTER TABLE public.diaper_age_groups REPLICA IDENTITY FULL;
ALTER TABLE public.diaper_stock REPLICA IDENTITY FULL;  
ALTER TABLE public.diaper_donations REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER publication supabase_realtime ADD TABLE public.diaper_age_groups;
ALTER publication supabase_realtime ADD TABLE public.diaper_stock;
ALTER publication supabase_realtime ADD TABLE public.diaper_donations;
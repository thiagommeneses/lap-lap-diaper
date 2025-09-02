-- CORREÇÃO DE SEGURANÇA CRÍTICA: Remover acesso público a dados de negócio

-- 1. Primeiro, remover dados legados com user_id NULL (dados sensíveis antigos)
DELETE FROM public.diaper_stock WHERE user_id IS NULL;
DELETE FROM public.diaper_age_groups WHERE user_id IS NULL;
DELETE FROM public.page_settings WHERE user_id IS NULL;

-- 2. Atualizar RLS policies para REMOVER acesso público (sem user_id IS NULL)
-- Política para diaper_age_groups - APENAS dados do usuário autenticado
DROP POLICY IF EXISTS "Users can view their own age groups" ON public.diaper_age_groups;
CREATE POLICY "Users can view their own age groups" ON public.diaper_age_groups
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own age groups" ON public.diaper_age_groups;
CREATE POLICY "Users can manage their own age groups" ON public.diaper_age_groups
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create age groups" ON public.diaper_age_groups;
CREATE POLICY "Users can create age groups" ON public.diaper_age_groups
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para diaper_stock - APENAS dados do usuário autenticado
DROP POLICY IF EXISTS "Users can view their own stock" ON public.diaper_stock;
CREATE POLICY "Users can view their own stock" ON public.diaper_stock
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own stock" ON public.diaper_stock;
CREATE POLICY "Users can manage their own stock" ON public.diaper_stock
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create stock" ON public.diaper_stock;
CREATE POLICY "Users can create stock" ON public.diaper_stock
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para page_settings - APENAS dados do usuário autenticado
DROP POLICY IF EXISTS "Users can view their own settings" ON public.page_settings;
CREATE POLICY "Users can view their own settings" ON public.page_settings
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.page_settings;
CREATE POLICY "Users can manage their own settings" ON public.page_settings
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create settings" ON public.page_settings;
CREATE POLICY "Users can create settings" ON public.page_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para diaper_usage - APENAS dados do usuário autenticado  
DROP POLICY IF EXISTS "Users can view their own usage" ON public.diaper_usage;
CREATE POLICY "Users can view their own usage" ON public.diaper_usage
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own usage" ON public.diaper_usage;
CREATE POLICY "Users can manage their own usage" ON public.diaper_usage
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create usage" ON public.diaper_usage;
CREATE POLICY "Users can create usage" ON public.diaper_usage
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Garantir que user_id seja obrigatório (NOT NULL) para prevenir futuros vazamentos
ALTER TABLE public.diaper_age_groups ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.diaper_stock ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.page_settings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.diaper_usage ALTER COLUMN user_id SET NOT NULL;
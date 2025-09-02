-- Adicionar user_id às tabelas que precisam ser isoladas por usuário
ALTER TABLE public.diaper_age_groups ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.diaper_stock ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.page_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.diaper_usage ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar RLS policies para diaper_age_groups
DROP POLICY IF EXISTS "Everyone can view age groups" ON public.diaper_age_groups;
DROP POLICY IF EXISTS "Admins can manage age groups" ON public.diaper_age_groups;

CREATE POLICY "Users can view their own age groups" ON public.diaper_age_groups
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own age groups" ON public.diaper_age_groups
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create age groups" ON public.diaper_age_groups
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atualizar RLS policies para diaper_stock
DROP POLICY IF EXISTS "Everyone can view stock" ON public.diaper_stock;
DROP POLICY IF EXISTS "Admins can manage stock" ON public.diaper_stock;

CREATE POLICY "Users can view their own stock" ON public.diaper_stock
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own stock" ON public.diaper_stock
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create stock" ON public.diaper_stock
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atualizar RLS policies para page_settings
DROP POLICY IF EXISTS "Everyone can view page settings" ON public.page_settings;
DROP POLICY IF EXISTS "Admins can manage page settings" ON public.page_settings;

CREATE POLICY "Users can view their own settings" ON public.page_settings
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own settings" ON public.page_settings
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create settings" ON public.page_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atualizar RLS policies para diaper_usage
DROP POLICY IF EXISTS "Everyone can view usage records" ON public.diaper_usage;
DROP POLICY IF EXISTS "Admins can manage usage records" ON public.diaper_usage;

CREATE POLICY "Users can view their own usage" ON public.diaper_usage
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage their own usage" ON public.diaper_usage
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can create usage" ON public.diaper_usage
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar função para inicializar dados padrão do usuário
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir configurações padrão da página
  INSERT INTO public.page_settings (user_id, title, subtitle, welcome_message)
  VALUES (
    NEW.id,
    'Lap Lap Diaper',
    'Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada',
    'Bem-vindo ao sistema de controle de fraldas'
  );

  -- Inserir grupos de idade padrão
  INSERT INTO public.diaper_age_groups (user_id, name, age_range, estimated_quantity, price_per_unit, color_theme, icon_name) VALUES
  (NEW.id, 'Recém-nascido', '0-3 meses', 300, 0.50, 'blue', 'Baby'),
  (NEW.id, 'P', '3-6 meses', 280, 0.45, 'pink', 'Heart'),
  (NEW.id, 'M', '6-12 meses', 250, 0.40, 'green', 'Smile'),
  (NEW.id, 'G', '12+ meses', 200, 0.35, 'yellow', 'Star');

  -- Inserir estoque inicial para cada grupo
  INSERT INTO public.diaper_stock (user_id, age_group_id, current_quantity)
  SELECT NEW.id, id, 0
  FROM public.diaper_age_groups
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$;

-- Criar trigger para inicializar dados do usuário
DROP TRIGGER IF EXISTS on_user_initialize_data ON auth.users;
CREATE TRIGGER on_user_initialize_data
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();

-- Criar view pública para últimos doadores (corrigida com prefixo de tabela)
CREATE OR REPLACE VIEW public.recent_donors AS
SELECT 
  dd.donor_name,
  dd.donation_date,
  dd.quantity,
  dag.name as age_group_name
FROM public.diaper_donations dd
JOIN public.diaper_age_groups dag ON dd.age_group_id = dag.id
WHERE dd.donor_name IS NOT NULL AND dd.donor_name != ''
ORDER BY dd.donation_date DESC, dd.created_at DESC
LIMIT 3;

-- Criar view pública para top doadores
CREATE OR REPLACE VIEW public.top_donors AS
SELECT 
  donor_name,
  SUM(quantity) as total_donated,
  COUNT(*) as donation_count
FROM public.diaper_donations
WHERE donor_name IS NOT NULL AND donor_name != ''
GROUP BY donor_name
ORDER BY total_donated DESC
LIMIT 3;

-- Dar permissão de SELECT nas views para usuários anônimos
GRANT SELECT ON public.recent_donors TO anon;
GRANT SELECT ON public.top_donors TO anon;
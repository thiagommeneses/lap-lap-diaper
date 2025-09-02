-- Criar tabela para configurações de faixas etárias de fraldas
CREATE TABLE public.diaper_age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  estimated_quantity INTEGER NOT NULL DEFAULT 0,
  price_per_unit DECIMAL(10,2) DEFAULT 0,
  color_theme TEXT DEFAULT 'blue',
  icon_name TEXT DEFAULT 'Baby',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para controle de estoque
CREATE TABLE public.diaper_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group_id UUID REFERENCES public.diaper_age_groups(id) ON DELETE CASCADE,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Criar tabela para doações/entradas
CREATE TABLE public.diaper_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_group_id UUID REFERENCES public.diaper_age_groups(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  donor_name TEXT,
  donor_contact TEXT,
  donation_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar tabela para perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir dados iniciais das faixas etárias
INSERT INTO public.diaper_age_groups (name, age_range, estimated_quantity, price_per_unit, color_theme, icon_name) VALUES
  ('Recém-nascido', '0-2 meses', 240, 0.80, 'blue', 'Baby'),
  ('Tamanho P', '2-6 meses', 300, 0.85, 'pink', 'Heart'),
  ('Tamanho M', '6-12 meses', 280, 0.90, 'purple', 'Smile'),
  ('Tamanho G', '12-24 meses', 200, 0.95, 'mint', 'Star');

-- Inserir estoque inicial para cada faixa etária
INSERT INTO public.diaper_stock (age_group_id, current_quantity)
SELECT id, 
  CASE name
    WHEN 'Recém-nascido' THEN 180
    WHEN 'Tamanho P' THEN 220
    WHEN 'Tamanho M' THEN 150
    WHEN 'Tamanho G' THEN 80
  END
FROM public.diaper_age_groups;

-- Habilitar RLS nas tabelas
ALTER TABLE public.diaper_age_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaper_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaper_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública (dashboard público)
CREATE POLICY "Everyone can view age groups" ON public.diaper_age_groups FOR SELECT USING (true);
CREATE POLICY "Everyone can view stock" ON public.diaper_stock FOR SELECT USING (true);
CREATE POLICY "Everyone can view donations" ON public.diaper_donations FOR SELECT USING (true);

-- Políticas para administradores
CREATE POLICY "Admins can manage age groups" ON public.diaper_age_groups 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can manage stock" ON public.diaper_stock 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can manage donations" ON public.diaper_donations 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Políticas para perfis
CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email,
    false
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps automaticamente
CREATE TRIGGER update_diaper_age_groups_updated_at
  BEFORE UPDATE ON public.diaper_age_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar estoque após doação
CREATE OR REPLACE FUNCTION public.update_stock_after_donation()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar quantidade no estoque
  UPDATE public.diaper_stock 
  SET 
    current_quantity = current_quantity + NEW.quantity,
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque automaticamente após doação
CREATE TRIGGER update_stock_on_donation
  AFTER INSERT ON public.diaper_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_after_donation();
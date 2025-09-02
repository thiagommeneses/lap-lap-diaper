-- Criar tabela para informações do bebê
CREATE TABLE public.baby_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  is_born BOOLEAN DEFAULT false,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'não_informado')) DEFAULT 'não_informado',
  birth_place TEXT,
  parent1_name TEXT,
  parent2_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.baby_info ENABLE ROW LEVEL SECURITY;

-- Políticas para baby_info
CREATE POLICY "Admins can manage baby info" 
ON public.baby_info 
FOR ALL 
USING (is_current_user_admin());

CREATE POLICY "Everyone can view baby info" 
ON public.baby_info 
FOR SELECT 
USING (true);

-- Criar tabela para consumo/redução de estoque
CREATE TABLE public.diaper_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  age_group_id UUID,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  usage_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.diaper_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para diaper_usage
CREATE POLICY "Admins can manage usage records" 
ON public.diaper_usage 
FOR ALL 
USING (is_current_user_admin());

CREATE POLICY "Everyone can view usage records" 
ON public.diaper_usage 
FOR SELECT 
USING (true);

-- Trigger para atualizar estoque após consumo
CREATE OR REPLACE FUNCTION public.update_stock_after_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduzir quantidade no estoque
  UPDATE public.diaper_stock 
  SET 
    current_quantity = GREATEST(0, current_quantity - NEW.quantity),
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para consumo
CREATE TRIGGER trigger_update_stock_after_usage
  AFTER INSERT ON public.diaper_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_after_usage();

-- Adicionar trigger de updated_at para baby_info
CREATE TRIGGER update_baby_info_updated_at
  BEFORE UPDATE ON public.baby_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
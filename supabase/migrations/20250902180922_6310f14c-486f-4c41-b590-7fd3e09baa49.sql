-- Criar tabela para compras próprias
CREATE TABLE public.diaper_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  age_group_id UUID REFERENCES public.diaper_age_groups(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  purchase_date DATE DEFAULT CURRENT_DATE,
  store_name TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.diaper_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas para compras (apenas admins)
CREATE POLICY "Only admins can view purchases" 
ON public.diaper_purchases 
FOR SELECT 
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Admins can insert purchases" 
ON public.diaper_purchases 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can update purchases" 
ON public.diaper_purchases 
FOR UPDATE 
TO authenticated
USING (public.is_current_user_admin());

CREATE POLICY "Admins can delete purchases" 
ON public.diaper_purchases 
FOR DELETE 
TO authenticated
USING (public.is_current_user_admin());

-- Criar trigger para atualizar estoque após compra
CREATE OR REPLACE FUNCTION public.update_stock_after_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar quantidade no estoque
  UPDATE public.diaper_stock 
  SET 
    current_quantity = current_quantity + NEW.quantity,
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa após inserção de compra
CREATE TRIGGER after_purchase_insert
AFTER INSERT ON public.diaper_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_after_purchase();

-- Verificar se o trigger de doação existe e está funcionando
-- Se não existir, vamos criá-lo
CREATE OR REPLACE FUNCTION public.update_stock_after_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar quantidade no estoque
  UPDATE public.diaper_stock 
  SET 
    current_quantity = current_quantity + NEW.quantity,
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id;
  
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir e criar novo
DROP TRIGGER IF EXISTS after_donation_insert ON public.diaper_donations;
CREATE TRIGGER after_donation_insert
AFTER INSERT ON public.diaper_donations
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_after_donation();
-- Atualizar triggers para incluir user_id nas operações de estoque
CREATE OR REPLACE FUNCTION public.update_stock_after_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar quantidade no estoque com user_id
  UPDATE public.diaper_stock 
  SET 
    current_quantity = current_quantity + NEW.quantity,
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id 
    AND user_id = (SELECT user_id FROM public.diaper_age_groups WHERE id = NEW.age_group_id);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_stock_after_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reduzir quantidade no estoque com user_id
  UPDATE public.diaper_stock 
  SET 
    current_quantity = GREATEST(0, current_quantity - NEW.quantity),
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id 
    AND user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_stock_after_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar quantidade no estoque com user_id
  UPDATE public.diaper_stock 
  SET 
    current_quantity = current_quantity + NEW.quantity,
    last_updated_at = now()
  WHERE age_group_id = NEW.age_group_id 
    AND user_id = (SELECT user_id FROM public.diaper_age_groups WHERE id = NEW.age_group_id);
  
  RETURN NEW;
END;
$$;
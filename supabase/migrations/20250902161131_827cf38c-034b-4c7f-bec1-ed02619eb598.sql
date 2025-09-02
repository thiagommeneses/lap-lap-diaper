-- Corrigir o search_path das funções existentes
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_stock_after_donation();

-- Recriar função para criar perfil automaticamente (com search_path correto)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
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

-- Recriar função para atualizar estoque após doação (com search_path correto)
CREATE OR REPLACE FUNCTION public.update_stock_after_donation()
RETURNS TRIGGER 
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
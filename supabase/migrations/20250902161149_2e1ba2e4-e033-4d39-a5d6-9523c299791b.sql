-- Remover triggers primeiro, depois recriar tudo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_stock_on_donation ON public.diaper_donations;

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

-- Recriar triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_stock_on_donation
  AFTER INSERT ON public.diaper_donations
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_after_donation();
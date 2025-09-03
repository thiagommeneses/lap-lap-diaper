-- Update the initialize_user_data function with new default values
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir configurações padrão da página
  INSERT INTO public.page_settings (user_id, title, subtitle, welcome_message)
  VALUES (
    NEW.id,
    'Lap Lap Diaper',
    'Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada',
    'Bem-vindo ao sistema de controle de fraldas'
  );

  -- Inserir grupos de idade padrão com os novos valores
  INSERT INTO public.diaper_age_groups (user_id, name, age_range, estimated_quantity, price_per_unit, color_theme, icon_name) VALUES
  (NEW.id, 'Recém-nascido', '0-1 mês', 280, 1.10, 'blue', 'Baby'),
  (NEW.id, 'P', '1-2 meses', 500, 1.10, 'pink', 'Heart'),
  (NEW.id, 'M', '3-8 meses', 1024, 1.05, 'green', 'Smile'),
  (NEW.id, 'G', '9-18 meses', 1000, 1.00, 'yellow', 'Star'),
  (NEW.id, 'XG/XXG', '18-24 meses', 800, 1.50, 'purple', 'Baby');

  -- Inserir estoque inicial para cada grupo
  INSERT INTO public.diaper_stock (user_id, age_group_id, current_quantity)
  SELECT NEW.id, id, 0
  FROM public.diaper_age_groups
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$function$;
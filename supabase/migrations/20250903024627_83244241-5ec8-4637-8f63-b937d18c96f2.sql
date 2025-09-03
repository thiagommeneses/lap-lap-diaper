-- Add XG/XXG diaper age group
INSERT INTO public.diaper_age_groups (
  name,
  age_range,
  estimated_quantity,
  price_per_unit,
  color_theme,
  icon_name,
  user_id
) 
SELECT 
  'XG/XXG',
  'Extra Grande',
  50,
  0.80,
  'purple',
  'Baby',
  id
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.diaper_age_groups 
  WHERE name = 'XG/XXG' AND user_id = auth.users.id
);
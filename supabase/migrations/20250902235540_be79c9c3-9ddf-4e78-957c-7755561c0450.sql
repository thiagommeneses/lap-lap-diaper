-- Função para obter dados públicos dos doadores por slug do bebê
CREATE OR REPLACE FUNCTION public.get_donation_data_by_slug(baby_slug text)
RETURNS TABLE(
  top_donors json,
  recent_donors json,
  total_donations bigint,
  total_donated bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar o user_id pelo slug do bebê
  SELECT b.user_id INTO target_user_id
  FROM public.baby_info b
  WHERE b.url_slug = baby_slug
  LIMIT 1;
  
  -- Se não encontrou o bebê, retornar dados vazios
  IF target_user_id IS NULL THEN
    RETURN QUERY
    SELECT 
      '[]'::json as top_donors,
      '[]'::json as recent_donors,
      0::bigint as total_donations,
      0::bigint as total_donated;
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    -- Top 3 doadores (por quantidade total doada)
    COALESCE(
      (SELECT json_agg(donor_data)
       FROM (
         SELECT 
           COALESCE(dd.donor_name, 'Doador Anônimo') as name,
           SUM(dd.quantity) as total_quantity,
           COUNT(dd.id) as donation_count
         FROM public.diaper_donations dd
         JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
         WHERE dag.user_id = target_user_id
           AND dd.donor_name IS NOT NULL 
           AND dd.donor_name != ''
         GROUP BY dd.donor_name
         ORDER BY SUM(dd.quantity) DESC
         LIMIT 3
       ) as donor_data),
      '[]'::json
    ) as top_donors,
    
    -- 3 doações mais recentes
    COALESCE(
      (SELECT json_agg(recent_data)
       FROM (
         SELECT 
           COALESCE(dd.donor_name, 'Doador Anônimo') as name,
           dd.quantity,
           dag.name as age_group_name,
           dd.donation_date,
           dd.created_at
         FROM public.diaper_donations dd
         JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
         WHERE dag.user_id = target_user_id
         ORDER BY dd.created_at DESC
         LIMIT 3
       ) as recent_data),
      '[]'::json
    ) as recent_donors,
    
    -- Total de doações
    COALESCE(
      (SELECT COUNT(dd.id)
       FROM public.diaper_donations dd
       JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
       WHERE dag.user_id = target_user_id),
      0
    )::bigint as total_donations,
    
    -- Total de fraldas doadas
    COALESCE(
      (SELECT SUM(dd.quantity)
       FROM public.diaper_donations dd
       JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
       WHERE dag.user_id = target_user_id),
      0
    )::bigint as total_donated;
END;
$function$;
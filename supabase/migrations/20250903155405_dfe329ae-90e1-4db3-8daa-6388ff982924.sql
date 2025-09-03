-- Corrigir função get_baby_profile_by_slug para incluir o ID dos grupos de fraldas
CREATE OR REPLACE FUNCTION public.get_baby_profile_by_slug(baby_slug text)
RETURNS TABLE(
  url_slug text,
  name text,
  birth_date date,
  is_born boolean,
  gender text,
  birth_place text,
  parent1_name text,
  parent2_name text,
  title text,
  subtitle text,
  welcome_message text,
  diaper_groups json
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.url_slug,
    b.name,
    b.birth_date,
    b.is_born,
    b.gender,
    b.birth_place,
    b.parent1_name,
    b.parent2_name,
    ps.title,
    ps.subtitle,
    ps.welcome_message,
    -- Aggregate diaper data for public view - INCLUINDO O ID
    COALESCE(
      json_agg(
        json_build_object(
          'id', dag.id,  -- Campo ID estava faltando!
          'name', dag.name,
          'age_range', dag.age_range,
          'current_quantity', COALESCE(ds.current_quantity, 0),
          'estimated_quantity', dag.estimated_quantity,
          'color_theme', dag.color_theme,
          'icon_name', dag.icon_name,
          'progress_percentage', 
          CASE 
            WHEN dag.estimated_quantity > 0 
            THEN ROUND((COALESCE(ds.current_quantity, 0)::numeric / dag.estimated_quantity::numeric) * 100)
            ELSE 0 
          END
        ) ORDER BY dag.created_at
      ) FILTER (WHERE dag.id IS NOT NULL), 
      '[]'::json
    ) as diaper_groups
  FROM public.baby_info b
  LEFT JOIN public.page_settings ps ON ps.user_id = b.user_id
  LEFT JOIN public.diaper_age_groups dag ON dag.user_id = b.user_id
  LEFT JOIN public.diaper_stock ds ON ds.age_group_id = dag.id AND ds.user_id = b.user_id
  WHERE b.url_slug = baby_slug
  GROUP BY b.url_slug, b.name, b.birth_date, b.is_born, b.gender, b.birth_place, b.parent1_name, b.parent2_name, ps.title, ps.subtitle, ps.welcome_message;
END;
$$;
-- Create function to get detailed user statistics for super admin
CREATE OR REPLACE FUNCTION public.get_user_detailed_stats(target_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  -- Check if current user is super admin
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can access detailed user stats';
  END IF;
  
  SELECT json_build_object(
    'user_info', (
      SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'display_name', p.display_name,
        'is_admin', p.is_admin,
        'super_admin', p.super_admin,
        'created_at', p.created_at
      )
      FROM public.profiles p
      WHERE p.id = target_user_id
    ),
    'baby_info', (
      SELECT json_agg(
        json_build_object(
          'id', b.id,
          'name', b.name,
          'url_slug', b.url_slug,
          'birth_date', b.birth_date,
          'is_born', b.is_born,
          'gender', b.gender,
          'birth_place', b.birth_place,
          'parent1_name', b.parent1_name,
          'parent2_name', b.parent2_name,
          'created_at', b.created_at
        )
      )
      FROM public.baby_info b
      WHERE b.user_id = target_user_id
    ),
    'page_settings', (
      SELECT json_build_object(
        'title', ps.title,
        'subtitle', ps.subtitle,
        'welcome_message', ps.welcome_message
      )
      FROM public.page_settings ps
      WHERE ps.user_id = target_user_id
      LIMIT 1
    ),
    'diaper_stats', (
      SELECT json_build_object(
        'total_donations', COALESCE(donations.total_donations, 0),
        'total_donated_quantity', COALESCE(donations.total_quantity, 0),
        'total_purchases', COALESCE(purchases.total_purchases, 0),
        'total_purchased_quantity', COALESCE(purchases.total_quantity, 0),
        'total_usage', COALESCE(usage.total_usage, 0),
        'total_used_quantity', COALESCE(usage.total_quantity, 0),
        'current_stock', COALESCE(stock.total_stock, 0)
      )
      FROM (
        -- Donations stats
        SELECT 
          COUNT(dd.id) as total_donations,
          COALESCE(SUM(dd.quantity), 0) as total_quantity
        FROM public.diaper_donations dd
        JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
        WHERE dag.user_id = target_user_id
      ) donations
      CROSS JOIN (
        -- Purchases stats
        SELECT 
          COUNT(dp.id) as total_purchases,
          COALESCE(SUM(dp.quantity), 0) as total_quantity
        FROM public.diaper_purchases dp
        JOIN public.diaper_age_groups dag ON dag.id = dp.age_group_id
        WHERE dag.user_id = target_user_id
      ) purchases
      CROSS JOIN (
        -- Usage stats
        SELECT 
          COUNT(du.id) as total_usage,
          COALESCE(SUM(du.quantity), 0) as total_quantity
        FROM public.diaper_usage du
        WHERE du.user_id = target_user_id
      ) usage
      CROSS JOIN (
        -- Current stock
        SELECT 
          COALESCE(SUM(ds.current_quantity), 0) as total_stock
        FROM public.diaper_stock ds
        WHERE ds.user_id = target_user_id
      ) stock
    ),
    'age_groups', (
      SELECT json_agg(
        json_build_object(
          'id', dag.id,
          'name', dag.name,
          'age_range', dag.age_range,
          'estimated_quantity', dag.estimated_quantity,
          'price_per_unit', dag.price_per_unit,
          'color_theme', dag.color_theme,
          'icon_name', dag.icon_name,
          'current_stock', COALESCE(ds.current_quantity, 0)
        )
      )
      FROM public.diaper_age_groups dag
      LEFT JOIN public.diaper_stock ds ON ds.age_group_id = dag.id AND ds.user_id = dag.user_id
      WHERE dag.user_id = target_user_id
      ORDER BY dag.created_at
    ),
    'recent_activities', (
      SELECT json_build_object(
        'recent_donations', (
          SELECT json_agg(recent_donation)
          FROM (
            SELECT json_build_object(
              'id', dd.id,
              'quantity', dd.quantity,
              'donor_name', dd.donor_name,
              'donation_date', dd.donation_date,
              'age_group_name', dag.name
            ) as recent_donation
            FROM public.diaper_donations dd
            JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
            WHERE dag.user_id = target_user_id
            ORDER BY dd.created_at DESC
            LIMIT 5
          ) recent_donations_data
        ),
        'recent_usage', (
          SELECT json_agg(recent_usage)
          FROM (
            SELECT json_build_object(
              'id', du.id,
              'quantity', du.quantity,
              'usage_date', du.usage_date,
              'age_group_name', dag.name
            ) as recent_usage
            FROM public.diaper_usage du
            JOIN public.diaper_age_groups dag ON dag.id = du.age_group_id
            WHERE du.user_id = target_user_id
            ORDER BY du.created_at DESC
            LIMIT 5
          ) recent_usage_data
        )
      )
    )
  ) INTO result;
  
  RETURN result;
END;
$function$;
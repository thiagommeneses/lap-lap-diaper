-- Fix the search path and make the function work properly
DROP FUNCTION IF EXISTS get_user_reminders(UUID);

CREATE OR REPLACE FUNCTION get_user_reminders(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  reminder_type TEXT,
  title TEXT,
  message TEXT,
  age_group_name TEXT,
  current_stock INTEGER,
  threshold_quantity INTEGER,
  is_read BOOLEAN,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) SECURITY DEFINER 
SET search_path = public
LANGUAGE SQL AS $$
  -- Check if user can access reminders
  SELECT 
    r.id,
    r.reminder_type::TEXT,
    r.title,
    r.message,
    ag.name as age_group_name,
    COALESCE(ds.current_quantity, 0) as current_stock,
    r.threshold_quantity,
    r.is_read,
    r.triggered_at,
    r.created_at
  FROM reminders r
  LEFT JOIN diaper_age_groups ag ON r.age_group_id = ag.id
  LEFT JOIN diaper_stock ds ON r.age_group_id = ds.age_group_id AND ds.user_id = r.user_id
  WHERE 
    r.is_active = true 
    AND r.user_id = COALESCE(target_user_id, auth.uid())
    AND r.user_id = auth.uid() -- Security check: user can only see their own reminders
  ORDER BY 
    CASE WHEN r.is_read THEN 1 ELSE 0 END,
    COALESCE(r.triggered_at, r.created_at) DESC;
$$;
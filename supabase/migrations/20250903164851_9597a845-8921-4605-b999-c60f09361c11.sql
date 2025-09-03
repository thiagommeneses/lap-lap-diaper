-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  age_group_id UUID,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('low_stock', 'restock', 'donation_check')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_quantity INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_read BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminders" 
ON public.reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check and trigger reminders
CREATE OR REPLACE FUNCTION public.check_stock_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update reminders when stock is low
  UPDATE public.reminders r
  SET 
    is_read = false,
    triggered_at = now(),
    updated_at = now()
  FROM public.diaper_stock ds
  WHERE r.age_group_id = ds.age_group_id
    AND r.user_id = ds.user_id
    AND r.reminder_type = 'low_stock'
    AND r.is_active = true
    AND ds.current_quantity <= COALESCE(r.threshold_quantity, 50)
    AND (r.triggered_at IS NULL OR r.triggered_at < now() - INTERVAL '24 hours');
END;
$$;

-- Create function to get active reminders for user
CREATE OR REPLACE FUNCTION public.get_user_reminders(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  reminder_type text,
  title text,
  message text,
  age_group_name text,
  current_stock integer,
  threshold_quantity integer,
  is_read boolean,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user can access reminders
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'You can only access your own reminders';
  END IF;
  
  RETURN QUERY
  SELECT 
    r.id,
    r.reminder_type,
    r.title,
    r.message,
    dag.name as age_group_name,
    COALESCE(ds.current_quantity, 0) as current_stock,
    r.threshold_quantity,
    r.is_read,
    r.triggered_at,
    r.created_at
  FROM public.reminders r
  LEFT JOIN public.diaper_age_groups dag ON dag.id = r.age_group_id
  LEFT JOIN public.diaper_stock ds ON ds.age_group_id = r.age_group_id AND ds.user_id = r.user_id
  WHERE r.user_id = target_user_id
    AND r.is_active = true
    AND (r.triggered_at IS NOT NULL OR r.reminder_type != 'low_stock')
  ORDER BY r.is_read ASC, r.triggered_at DESC NULLS LAST, r.created_at DESC;
END;
$$;
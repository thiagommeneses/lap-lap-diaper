-- Add URL slug field to baby_info table for personalized URLs
ALTER TABLE public.baby_info 
ADD COLUMN url_slug text UNIQUE;

-- Create index for fast URL lookups
CREATE INDEX idx_baby_info_url_slug ON public.baby_info(url_slug);

-- Add function to generate URL slug from baby name
CREATE OR REPLACE FUNCTION public.generate_url_slug(input_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convert name to URL-friendly slug
  base_slug := lower(trim(input_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- If empty after processing, use 'baby'
  IF base_slug = '' THEN
    base_slug := 'baby';
  END IF;
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  WHILE EXISTS (SELECT 1 FROM public.baby_info WHERE url_slug = final_slug) LOOP
    final_slug := base_slug || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-generate slug when baby name is updated
CREATE OR REPLACE FUNCTION public.auto_generate_baby_slug()
RETURNS trigger AS $$
BEGIN
  -- Only generate slug if name changed and slug is not manually set
  IF NEW.name IS DISTINCT FROM OLD.name AND (NEW.url_slug IS NULL OR NEW.url_slug = OLD.url_slug) THEN
    NEW.url_slug := public.generate_url_slug(NEW.name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate slug on baby info updates
CREATE TRIGGER baby_info_auto_slug
  BEFORE UPDATE ON public.baby_info
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_baby_slug();

-- Create trigger to auto-generate slug on baby info inserts
CREATE OR REPLACE FUNCTION public.auto_generate_baby_slug_insert()
RETURNS trigger AS $$
BEGIN
  -- Generate slug if not provided
  IF NEW.url_slug IS NULL THEN
    NEW.url_slug := public.generate_url_slug(NEW.name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER baby_info_auto_slug_insert
  BEFORE INSERT ON public.baby_info
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_baby_slug_insert();

-- Create public view for baby profiles (for public access without login)
CREATE OR REPLACE VIEW public.baby_profiles AS
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
  -- Aggregate diaper data for public view
  COALESCE(
    json_agg(
      json_build_object(
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
WHERE b.url_slug IS NOT NULL
GROUP BY b.url_slug, b.name, b.birth_date, b.is_born, b.gender, b.birth_place, b.parent1_name, b.parent2_name, ps.title, ps.subtitle, ps.welcome_message;

-- Grant access to public view for anonymous users
GRANT SELECT ON public.baby_profiles TO anon;
GRANT SELECT ON public.baby_profiles TO authenticated;
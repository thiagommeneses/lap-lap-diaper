-- Recriar views sem SECURITY DEFINER para corrigir alertas de segurança
DROP VIEW IF EXISTS public.recent_donors;
DROP VIEW IF EXISTS public.top_donors;

-- View para últimos doadores (sem SECURITY DEFINER)
CREATE VIEW public.recent_donors AS
SELECT 
  dd.donor_name,
  dd.donation_date,
  dd.quantity,
  dag.name as age_group_name
FROM public.diaper_donations dd
JOIN public.diaper_age_groups dag ON dd.age_group_id = dag.id
WHERE dd.donor_name IS NOT NULL AND dd.donor_name != ''
ORDER BY dd.donation_date DESC, dd.created_at DESC
LIMIT 3;

-- View para top doadores (sem SECURITY DEFINER)
CREATE VIEW public.top_donors AS
SELECT 
  donor_name,
  SUM(quantity) as total_donated,
  COUNT(*) as donation_count
FROM public.diaper_donations
WHERE donor_name IS NOT NULL AND donor_name != ''
GROUP BY donor_name
ORDER BY total_donated DESC
LIMIT 3;

-- Dar permissão de SELECT nas views para usuários anônimos
GRANT SELECT ON public.recent_donors TO anon;
GRANT SELECT ON public.top_donors TO anon;
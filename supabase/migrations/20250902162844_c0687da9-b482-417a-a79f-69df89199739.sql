-- Corrigir o problema de segurança da view
-- Remover a view e criar uma função mais segura

DROP VIEW IF EXISTS public.donation_summary;

-- Criar função para estatísticas públicas (sem dados pessoais)
CREATE OR REPLACE FUNCTION public.get_donation_stats()
RETURNS TABLE (
  age_group_id UUID,
  age_group_name TEXT,
  total_donations BIGINT,
  total_quantity BIGINT,
  last_donation_date DATE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dag.id,
    dag.name,
    COUNT(dd.id),
    COALESCE(SUM(dd.quantity), 0),
    MAX(dd.donation_date)
  FROM public.diaper_age_groups dag
  LEFT JOIN public.diaper_donations dd ON dag.id = dd.age_group_id
  GROUP BY dag.id, dag.name;
$$;
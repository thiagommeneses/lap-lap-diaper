-- CORREÇÃO DE SEGURANÇA: Restringir acesso às informações dos doadores

-- Remover política pública perigosa
DROP POLICY IF EXISTS "Everyone can view donations" ON public.diaper_donations;

-- Criar política restrita apenas para administradores
CREATE POLICY "Only admins can view donation details" ON public.diaper_donations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Permitir que admins gerenciem doações
CREATE POLICY "Admins can manage donations" ON public.diaper_donations 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Criar view pública com dados agregados (SEM informações pessoais)
CREATE OR REPLACE VIEW public.donation_summary AS
SELECT 
  dag.id as age_group_id,
  dag.name as age_group_name,
  COUNT(dd.id) as total_donations,
  SUM(dd.quantity) as total_quantity,
  MAX(dd.donation_date) as last_donation_date
FROM public.diaper_age_groups dag
LEFT JOIN public.diaper_donations dd ON dag.id = dd.age_group_id
GROUP BY dag.id, dag.name;

-- Permitir acesso público apenas à view agregada
CREATE POLICY "Everyone can view donation summary" ON public.diaper_age_groups FOR SELECT USING (true);

-- Nota: A view não precisa de RLS pois não contém dados sensíveis
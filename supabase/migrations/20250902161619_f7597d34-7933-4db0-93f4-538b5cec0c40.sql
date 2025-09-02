-- CORREÇÃO DE SEGURANÇA: Restringir acesso às informações dos doadores

-- Remover todas as políticas existentes da tabela diaper_donations
DROP POLICY IF EXISTS "Everyone can view donations" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can manage donations" ON public.diaper_donations;

-- Criar política restrita apenas para administradores visualizarem
CREATE POLICY "Only admins can view donation details" ON public.diaper_donations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Permitir que admins insiram/atualizem/deletem doações
CREATE POLICY "Admins can insert donations" ON public.diaper_donations 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update donations" ON public.diaper_donations 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete donations" ON public.diaper_donations 
FOR DELETE USING (
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
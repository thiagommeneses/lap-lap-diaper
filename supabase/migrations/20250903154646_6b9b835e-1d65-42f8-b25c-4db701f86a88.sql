-- Atualizar política de inserção de doações para permitir doações públicas
DROP POLICY IF EXISTS "Users can insert donations for their age groups" ON public.diaper_donations;

CREATE POLICY "Allow public donations" 
ON public.diaper_donations 
FOR INSERT 
WITH CHECK (
  -- Permitir doações de usuários autenticados para seus grupos
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM diaper_age_groups dag 
    WHERE dag.id = diaper_donations.age_group_id 
    AND dag.user_id = auth.uid()
  ))
  OR 
  -- Permitir doações públicas (usuários não autenticados) para qualquer grupo
  (auth.uid() IS NULL AND created_by IS NULL)
);
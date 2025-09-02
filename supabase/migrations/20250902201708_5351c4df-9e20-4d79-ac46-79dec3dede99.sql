-- Adicionar coluna de propriedade à tabela baby_info para implementar controle de acesso por usuário

-- Adicionar coluna user_id para rastrear propriedade
ALTER TABLE public.baby_info 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar registros existentes para associá-los a um usuário admin (se existir)
-- Isso evita perda de dados existentes
UPDATE public.baby_info 
SET user_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.is_admin = true 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Tornar a coluna NOT NULL após a atualização
ALTER TABLE public.baby_info 
ALTER COLUMN user_id SET NOT NULL;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view baby info" ON public.baby_info;
DROP POLICY IF EXISTS "Authenticated users can insert baby info" ON public.baby_info;
DROP POLICY IF EXISTS "Authenticated users can update baby info" ON public.baby_info;
DROP POLICY IF EXISTS "Admins can delete baby info" ON public.baby_info;

-- Criar políticas seguras baseadas em propriedade
CREATE POLICY "Users can view their own baby info" 
ON public.baby_info 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Users can insert their own baby info" 
ON public.baby_info 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own baby info" 
ON public.baby_info 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id OR is_current_user_admin())
WITH CHECK (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Admins can delete baby info" 
ON public.baby_info 
FOR DELETE 
TO authenticated
USING (is_current_user_admin());
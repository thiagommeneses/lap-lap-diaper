-- Corrigir políticas RLS da tabela baby_info para proteger dados pessoais sensíveis

-- Remover política insegura que permite acesso público
DROP POLICY IF EXISTS "Everyone can view baby info" ON public.baby_info;

-- Remover política que restringe gerenciamento apenas a admins
DROP POLICY IF EXISTS "Admins can manage baby info" ON public.baby_info;

-- Criar políticas seguras para usuários autenticados
CREATE POLICY "Authenticated users can view baby info" 
ON public.baby_info 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert baby info" 
ON public.baby_info 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update baby info" 
ON public.baby_info 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Manter política de admin para delete (operação mais sensível)
CREATE POLICY "Admins can delete baby info" 
ON public.baby_info 
FOR DELETE 
TO authenticated
USING (is_current_user_admin());
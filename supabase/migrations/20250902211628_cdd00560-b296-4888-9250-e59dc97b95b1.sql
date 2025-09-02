-- CORREÇÃO DE SEGURANÇA: Remover views com SECURITY DEFINER vulneráveis

-- As views recent_donors e top_donors representam riscos de segurança pois:
-- 1. Foram criadas com SECURITY DEFINER (executam com privilégios elevados)  
-- 2. Tentam acessar dados de doações que agora são privados
-- 3. Podem contornar políticas RLS de forma não intencional

-- Remover completamente as views vulneráveis
DROP VIEW IF EXISTS public.recent_donors;
DROP VIEW IF EXISTS public.top_donors;
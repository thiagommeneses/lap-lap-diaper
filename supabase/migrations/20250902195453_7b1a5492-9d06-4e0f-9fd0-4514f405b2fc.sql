-- Criar tabela para configurações de texto da página inicial
CREATE TABLE public.page_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT DEFAULT 'Lap Lap Diaper',
  subtitle TEXT DEFAULT 'Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada',
  welcome_message TEXT DEFAULT 'Bem-vindo ao sistema de controle de fraldas',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para page_settings
CREATE POLICY "Admins can manage page settings" 
ON public.page_settings 
FOR ALL 
USING (is_current_user_admin());

CREATE POLICY "Everyone can view page settings" 
ON public.page_settings 
FOR SELECT 
USING (true);

-- Inserir configuração padrão
INSERT INTO public.page_settings (title, subtitle, welcome_message) 
VALUES (
  'Lap Lap Diaper',
  'Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada',
  'Bem-vindo ao sistema de controle de fraldas'
);

-- Adicionar trigger de updated_at para page_settings
CREATE TRIGGER update_page_settings_updated_at
  BEFORE UPDATE ON public.page_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
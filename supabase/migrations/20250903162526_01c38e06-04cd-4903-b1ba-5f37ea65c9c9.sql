-- Adicionar campo de status para aprovação de doações
ALTER TABLE public.diaper_donations 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Remover trigger que atualizava estoque automaticamente
DROP TRIGGER IF EXISTS update_stock_on_donation ON public.diaper_donations;

-- Criar novo trigger que só atualiza estoque quando doação é aprovada
CREATE OR REPLACE FUNCTION public.update_stock_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se a doação foi aprovada, atualizar estoque
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.diaper_stock 
    SET 
      current_quantity = current_quantity + NEW.quantity,
      last_updated_at = now()
    WHERE age_group_id = NEW.age_group_id 
      AND user_id = (SELECT user_id FROM public.diaper_age_groups WHERE id = NEW.age_group_id);
  END IF;
  
  -- Se a doação foi rejeitada após ter sido aprovada, reduzir estoque
  IF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE public.diaper_stock 
    SET 
      current_quantity = GREATEST(0, current_quantity - NEW.quantity),
      last_updated_at = now()
    WHERE age_group_id = NEW.age_group_id 
      AND user_id = (SELECT user_id FROM public.diaper_age_groups WHERE id = NEW.age_group_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para aprovação de doações
CREATE TRIGGER approve_donation_update_stock
  AFTER UPDATE ON public.diaper_donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_on_approval();

-- Adicionar índice para melhorar performance nas consultas por status
CREATE INDEX IF NOT EXISTS idx_diaper_donations_status ON public.diaper_donations(status);

-- Função para aprovar doação
CREATE OR REPLACE FUNCTION public.approve_donation(donation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário pode aprovar esta doação
  IF NOT EXISTS (
    SELECT 1 FROM public.diaper_donations dd
    JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
    WHERE dd.id = donation_id AND dag.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only approve donations for your own diaper groups';
  END IF;
  
  UPDATE public.diaper_donations 
  SET status = 'approved' 
  WHERE id = donation_id;
END;
$$;

-- Função para rejeitar doação
CREATE OR REPLACE FUNCTION public.reject_donation(donation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário pode rejeitar esta doação
  IF NOT EXISTS (
    SELECT 1 FROM public.diaper_donations dd
    JOIN public.diaper_age_groups dag ON dag.id = dd.age_group_id
    WHERE dd.id = donation_id AND dag.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'You can only reject donations for your own diaper groups';
  END IF;
  
  UPDATE public.diaper_donations 
  SET status = 'rejected' 
  WHERE id = donation_id;
END;
$$;
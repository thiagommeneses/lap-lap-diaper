-- Remover trigger duplicado que está causando duplicação no estoque
-- Manter apenas o trigger 'update_stock_on_donation' e remover o duplicado

DROP TRIGGER IF EXISTS after_donation_insert ON public.diaper_donations;
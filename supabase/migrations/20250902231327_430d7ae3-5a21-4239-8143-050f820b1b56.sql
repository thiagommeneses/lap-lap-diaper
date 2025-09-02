-- Add donor_email column to diaper_donations table
ALTER TABLE public.diaper_donations 
ADD COLUMN donor_email text;
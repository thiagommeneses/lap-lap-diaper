-- Update RLS policies for diaper_donations to allow regular users
DROP POLICY IF EXISTS "Only admins can view donation details" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can insert donations" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.diaper_donations;
DROP POLICY IF EXISTS "Admins can delete donations" ON public.diaper_donations;

-- Create new policies allowing users to manage their own donations
CREATE POLICY "Users can view donations for their age groups" 
ON public.diaper_donations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.diaper_age_groups dag 
    WHERE dag.id = diaper_donations.age_group_id 
    AND dag.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert donations for their age groups" 
ON public.diaper_donations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diaper_age_groups dag 
    WHERE dag.id = diaper_donations.age_group_id 
    AND dag.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own donations" 
ON public.diaper_donations 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own donations" 
ON public.diaper_donations 
FOR DELETE 
USING (created_by = auth.uid());
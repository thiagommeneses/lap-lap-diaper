-- Fix security issue: Add RLS policies to baby_profiles table
-- This table contains sensitive family information that needs protection

-- Enable Row Level Security on baby_profiles table
ALTER TABLE public.baby_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow public access to baby profiles via the secure function
-- This policy ensures that baby_profiles can only be accessed through controlled functions
CREATE POLICY "Baby profiles are only accessible through secure functions" 
ON public.baby_profiles 
FOR SELECT 
USING (false);

-- Since this table appears to be used for public profiles, we need to ensure
-- it can only be accessed through the secure get_baby_profile_by_slug function
-- which properly filters and controls what data is exposed publicly
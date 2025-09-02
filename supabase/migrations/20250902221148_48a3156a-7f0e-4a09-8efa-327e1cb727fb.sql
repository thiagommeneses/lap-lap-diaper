-- Fix security issue: Remove insecure baby_profiles view
-- This view exposes sensitive family information without any protection
-- The secure alternative is the get_baby_profile_by_slug function which properly controls access

-- Drop the insecure baby_profiles view
DROP VIEW IF EXISTS public.baby_profiles;

-- The secure access to baby profile data is now only through the 
-- get_baby_profile_by_slug function which properly filters and controls
-- what data is exposed publicly based on URL slug
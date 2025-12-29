-- Add 10th and 12th percentage fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenth_percentage numeric,
ADD COLUMN IF NOT EXISTS twelfth_percentage numeric;

-- Add extra information field to jobs for admin
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS extra_info text;
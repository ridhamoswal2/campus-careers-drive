
-- Create ENUMs for departments and courses
CREATE TYPE public.department AS ENUM ('AIIT', 'AIT', 'ASFT', 'AIBAS', 'OTHER');
CREATE TYPE public.course AS ENUM ('BCA', 'MCA', 'BTECH');

-- Add course column to profiles
ALTER TABLE public.profiles ADD COLUMN course public.course;

-- Update department column type (first drop old text column and add new enum column)
-- We need to handle existing data - for now we'll set to null and let users update
ALTER TABLE public.profiles DROP COLUMN department;
ALTER TABLE public.profiles ADD COLUMN department public.department;

-- Add eligibility columns to jobs table
ALTER TABLE public.jobs ADD COLUMN eligible_departments public.department[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN eligible_courses public.course[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN eligible_years INTEGER[] DEFAULT '{}';

-- Update the RLS policy for jobs to filter based on eligibility
DROP POLICY IF EXISTS "Anyone authenticated can view active jobs" ON public.jobs;

-- Create a function to check if a student is eligible for a job
CREATE OR REPLACE FUNCTION public.is_eligible_for_job(
  _user_id UUID,
  _eligible_departments public.department[],
  _eligible_courses public.course[],
  _eligible_years INTEGER[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND (
        -- If no restrictions, job is visible to all
        (array_length(_eligible_departments, 1) IS NULL OR _eligible_departments = '{}')
        AND (array_length(_eligible_courses, 1) IS NULL OR _eligible_courses = '{}')
        AND (array_length(_eligible_years, 1) IS NULL OR _eligible_years = '{}')
      )
      OR (
        -- Check if student matches eligibility criteria
        (array_length(_eligible_departments, 1) IS NULL OR _eligible_departments = '{}' OR p.department = ANY(_eligible_departments))
        AND (array_length(_eligible_courses, 1) IS NULL OR _eligible_courses = '{}' OR p.course = ANY(_eligible_courses))
        AND (array_length(_eligible_years, 1) IS NULL OR _eligible_years = '{}' OR p.year_of_study = ANY(_eligible_years))
      )
  )
$$;

-- New RLS policy for students to view eligible jobs
CREATE POLICY "Students can view eligible active jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_eligible_for_job(auth.uid(), eligible_departments, eligible_courses, eligible_years)
  )
);

-- Update handle_new_user function to include course
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user role (default to student)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  
  -- Create profile for students
  IF COALESCE((NEW.raw_user_meta_data->>'role')::text, 'student') = 'student' THEN
    INSERT INTO public.profiles (user_id, full_name, email, roll_number, department, course, year_of_study)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'roll_number',
      (NEW.raw_user_meta_data->>'department')::public.department,
      (NEW.raw_user_meta_data->>'course')::public.course,
      (NEW.raw_user_meta_data->>'year_of_study')::INTEGER
    );
  END IF;
  
  RETURN NEW;
END;
$$;

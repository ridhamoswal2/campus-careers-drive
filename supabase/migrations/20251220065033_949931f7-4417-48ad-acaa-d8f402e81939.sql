-- Drop existing restrictive policies on applications table
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
DROP POLICY IF EXISTS "Students can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Students can create applications" ON public.applications;

-- Create new PERMISSIVE policies for applications
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own applications"
ON public.applications
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Students can create applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = student_id) AND has_role(auth.uid(), 'student'::app_role));

-- Also fix profiles policies to allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
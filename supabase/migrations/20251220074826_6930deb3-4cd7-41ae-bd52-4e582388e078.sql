-- Drop existing restrictive policies on student_enrollments
DROP POLICY IF EXISTS "Anyone can view student enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can insert enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can update enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can delete enrollments" ON public.student_enrollments;

-- Create proper PERMISSIVE policies
CREATE POLICY "Anyone can view student enrollments" 
ON public.student_enrollments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert enrollments" 
ON public.student_enrollments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update enrollments" 
ON public.student_enrollments 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete enrollments" 
ON public.student_enrollments 
FOR DELETE 
TO authenticated
USING (true);
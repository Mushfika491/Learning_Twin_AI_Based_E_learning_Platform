-- Drop and recreate insert policy to allow anon users as well
DROP POLICY IF EXISTS "Authenticated users can insert enrollments" ON public.student_enrollments;

CREATE POLICY "Anyone can insert enrollments" 
ON public.student_enrollments 
FOR INSERT 
WITH CHECK (true);

-- Also update delete and update to allow anon
DROP POLICY IF EXISTS "Authenticated users can delete enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Authenticated users can update enrollments" ON public.student_enrollments;

CREATE POLICY "Anyone can delete enrollments" 
ON public.student_enrollments 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can update enrollments" 
ON public.student_enrollments 
FOR UPDATE 
USING (true);
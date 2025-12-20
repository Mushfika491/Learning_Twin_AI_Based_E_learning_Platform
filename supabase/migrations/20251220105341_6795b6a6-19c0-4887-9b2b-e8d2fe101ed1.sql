-- Add public read access policies for sample data viewing
DROP POLICY IF EXISTS "Students can view their own assessments" ON public.student_assessments;
DROP POLICY IF EXISTS "Students can view questions for their assessments" ON public.assessment_questions;

-- Allow all authenticated users to view assessments (for demo/sample data)
CREATE POLICY "Authenticated users can view all assessments"
  ON public.student_assessments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view questions (for demo/sample data)
CREATE POLICY "Authenticated users can view all questions"
  ON public.assessment_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);
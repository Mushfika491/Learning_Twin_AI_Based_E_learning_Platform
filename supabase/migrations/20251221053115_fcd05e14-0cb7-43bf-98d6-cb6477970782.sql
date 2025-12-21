-- Drop existing restrictive policies on assessment_questions
DROP POLICY IF EXISTS "Authenticated users can view all questions" ON assessment_questions;
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON assessment_questions;
DROP POLICY IF EXISTS "Authenticated users can update questions" ON assessment_questions;
DROP POLICY IF EXISTS "Authenticated users can delete questions" ON assessment_questions;

-- Create better policies for instructors to manage questions
CREATE POLICY "Instructors can view all questions"
ON assessment_questions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Instructors can insert questions"
ON assessment_questions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Instructors can update questions"
ON assessment_questions FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Instructors can delete questions"
ON assessment_questions FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'instructor'::app_role));

-- Add instructor policies for student_assessments (for assignment management)
DROP POLICY IF EXISTS "Authenticated users can view all assessments" ON student_assessments;

CREATE POLICY "Instructors can view all assessments"
ON student_assessments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Instructors can insert assessments"
ON student_assessments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Instructors can update assessments"
ON student_assessments FOR UPDATE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'instructor'::app_role));

CREATE POLICY "Instructors can delete assessments"
ON student_assessments FOR DELETE
USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'instructor'::app_role));
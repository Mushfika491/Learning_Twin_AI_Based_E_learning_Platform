-- First drop the RLS policy that depends on course_id column
DROP POLICY IF EXISTS "Students can view discussions for enrolled courses" ON public.discussions;

-- Drop existing foreign key constraint on discussions
ALTER TABLE public.discussions DROP CONSTRAINT IF EXISTS discussions_course_id_fkey;

-- Change course_id column type from uuid to character to align with student_courses
ALTER TABLE public.discussions ALTER COLUMN course_id TYPE character(36) USING course_id::text;

-- Create new RLS policy that allows viewing discussions for all courses
CREATE POLICY "Anyone can view discussions"
  ON public.discussions FOR SELECT
  USING (true);
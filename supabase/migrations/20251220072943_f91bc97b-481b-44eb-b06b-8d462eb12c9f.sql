-- Create student_enrollments table with specified structure
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  enrollment_id CHAR(7) NOT NULL PRIMARY KEY,
  course_id CHAR(7) NOT NULL,
  title VARCHAR(120) NOT NULL,
  learning_status VARCHAR(20) NOT NULL DEFAULT 'Not Started',
  created_at VARCHAR(25) NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI'),
  CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES public.student_courses(course_id) ON DELETE CASCADE
);

-- Create index on course_id for faster search
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course_id ON public.student_enrollments(course_id);

-- Enable Row Level Security
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view student enrollments"
ON public.student_enrollments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert enrollments"
ON public.student_enrollments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update enrollments"
ON public.student_enrollments
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete enrollments"
ON public.student_enrollments
FOR DELETE
USING (auth.uid() IS NOT NULL);
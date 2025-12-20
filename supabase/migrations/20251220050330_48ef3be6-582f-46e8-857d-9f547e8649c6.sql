-- Create student_courses table with exact schema requested
CREATE TABLE public.student_courses (
  course_id CHAR(7) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  difficulty_level VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  instructor_id CHAR(7),
  created_at VARCHAR(25) DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI')
);

-- Create index on course_id for faster search
CREATE INDEX idx_student_courses_course_id ON public.student_courses(course_id);

-- Create additional index on instructor_id for potential joins
CREATE INDEX idx_student_courses_instructor_id ON public.student_courses(instructor_id);

-- Enable Row Level Security
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view courses (public read)
CREATE POLICY "Anyone can view student courses"
ON public.student_courses
FOR SELECT
USING (true);

-- Create policy for authenticated users to manage courses
CREATE POLICY "Authenticated users can insert courses"
ON public.student_courses
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update courses"
ON public.student_courses
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete courses"
ON public.student_courses
FOR DELETE
USING (auth.uid() IS NOT NULL);
-- Create student_prerequisites table with specific columns as requested
CREATE TABLE public.student_prerequisites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id character(7) NOT NULL,
  course_title character varying(120) NOT NULL,
  prerequisite_course_id character(7) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_prerequisites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view prerequisites
CREATE POLICY "Anyone can view student prerequisites" 
ON public.student_prerequisites 
FOR SELECT 
USING (true);

-- Insert sample data that references existing courses
INSERT INTO public.student_prerequisites (course_id, course_title, prerequisite_course_id) VALUES
('CSE-102', 'Advanced Python Programming', 'CSE-101'),
('CSE-103', 'Data Science Fundamentals', 'CSE-102'),
('CSE-104', 'Machine Learning Basics', 'CSE-103'),
('CSE-105', 'Web Development', 'CSE-101'),
('CSE-106', 'Database Management', 'CSE-101');
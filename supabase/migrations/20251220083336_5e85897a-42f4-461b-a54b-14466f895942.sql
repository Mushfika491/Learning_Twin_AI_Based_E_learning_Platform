-- Create performance_reports table
CREATE TABLE public.performance_reports (
  performance_report_id character(8) NOT NULL PRIMARY KEY,
  course_id character(7) NOT NULL,
  student_id uuid NOT NULL,
  strengths varchar(255) NOT NULL,
  weakness varchar(255) NOT NULL,
  recommendations varchar(255) NOT NULL,
  generated_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for student access
CREATE POLICY "Students can view their own performance reports" 
ON public.performance_reports 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own performance reports" 
ON public.performance_reports 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own performance reports" 
ON public.performance_reports 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own performance reports" 
ON public.performance_reports 
FOR DELETE 
USING (auth.uid() = student_id);

-- Add index for faster searches
CREATE INDEX idx_performance_reports_course_id ON public.performance_reports(course_id);
CREATE INDEX idx_performance_reports_student_id ON public.performance_reports(student_id);
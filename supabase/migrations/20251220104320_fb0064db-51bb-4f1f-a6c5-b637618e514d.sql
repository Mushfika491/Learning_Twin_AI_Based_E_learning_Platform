-- Create student_assessments table for storing student assessment data
CREATE TABLE public.student_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id varchar NOT NULL,
  student_id uuid NOT NULL,
  assessment_type varchar NOT NULL,
  assessment_title varchar NOT NULL,
  obtained_mark numeric DEFAULT 0,
  total_marks numeric NOT NULL DEFAULT 100,
  due_date_time timestamp with time zone,
  performance_level varchar DEFAULT 'Pending',
  feedback text,
  status varchar DEFAULT 'Not Submitted',
  created_at timestamp with time zone DEFAULT now()
);

-- Create assessment_questions table for storing questions
CREATE TABLE public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id varchar NOT NULL,
  question_number integer NOT NULL,
  question_type varchar NOT NULL,
  question_text text NOT NULL,
  category varchar,
  correct_answer text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_assessments
CREATE POLICY "Students can view their own assessments"
  ON public.student_assessments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own assessments"
  ON public.student_assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own assessments"
  ON public.student_assessments FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own assessments"
  ON public.student_assessments FOR DELETE
  USING (auth.uid() = student_id);

-- RLS policies for assessment_questions (students can view questions for their assessments)
CREATE POLICY "Students can view questions for their assessments"
  ON public.assessment_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.student_assessments sa
    WHERE sa.assessment_id = assessment_questions.assessment_id
    AND sa.student_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can insert questions"
  ON public.assessment_questions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update questions"
  ON public.assessment_questions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete questions"
  ON public.assessment_questions FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Insert sample data for testing
INSERT INTO public.student_assessments (assessment_id, student_id, assessment_type, assessment_title, obtained_mark, total_marks, due_date_time, performance_level, feedback, status)
VALUES 
  ('ASM-001', '00000000-0000-0000-0000-000000000000', 'Quiz', 'Programming Basics Quiz', 85, 100, '2024-02-10 23:59:00+00', 'Excellent', 'Great understanding of core concepts', 'Graded'),
  ('ASM-002', '00000000-0000-0000-0000-000000000000', 'Assignment', 'Data Structures Assignment 1', 72, 80, '2024-02-15 23:59:00+00', 'Good', 'Well structured code, minor improvements needed', 'Graded');

INSERT INTO public.assessment_questions (assessment_id, question_number, question_type, question_text, category, correct_answer)
VALUES 
  ('ASM-001', 1, 'MCQ', 'What is a variable in programming?', 'Basics', 'A named storage location in memory'),
  ('ASM-001', 2, 'Short Q', 'Explain the difference between int and float data types', 'Data Types', 'Int stores whole numbers, float stores decimal numbers'),
  ('ASM-002', 1, 'MCQ', 'Which data structure uses LIFO principle?', 'Data Structures', 'Stack');
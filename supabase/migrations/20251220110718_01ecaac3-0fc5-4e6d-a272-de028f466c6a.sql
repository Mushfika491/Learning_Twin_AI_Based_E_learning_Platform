-- Create student_submissions table
CREATE TABLE public.student_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id CHARACTER(7) NOT NULL,
  answer VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Not Submitted',
  student_id uuid NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own submissions"
  ON public.student_submissions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own submissions"
  ON public.student_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own submissions"
  ON public.student_submissions FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own submissions"
  ON public.student_submissions FOR DELETE
  USING (auth.uid() = student_id);

-- Insert sample data aligned with assessments (which are aligned with courses)
INSERT INTO public.student_submissions (assessment_id, answer, status, student_id) VALUES
  ('asm-001', 'A variable is a named storage location in memory', 'Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-002', 'OOP uses classes and objects to structure code', 'Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-003', 'Binary search has O(log n) time complexity', 'Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-004', 'Normalization reduces data redundancy', 'Not Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-005', 'Agile focuses on iterative development', 'Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-006', 'Firewalls filter network traffic', 'Not Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-007', 'Machine learning uses patterns from data', 'Submitted', '00000000-0000-0000-0000-000000000000'),
  ('asm-008', 'Cloud computing provides on-demand resources', 'Submitted', '00000000-0000-0000-0000-000000000000');

-- Add policy for demo viewing
CREATE POLICY "Authenticated users can view all submissions for demo"
  ON public.student_submissions FOR SELECT
  USING (auth.uid() IS NOT NULL);
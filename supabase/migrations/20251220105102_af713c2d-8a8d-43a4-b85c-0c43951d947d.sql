-- Add course_id column to student_assessments to link with courses
ALTER TABLE public.student_assessments ADD COLUMN course_id varchar;

-- Add course_id column to assessment_questions
ALTER TABLE public.assessment_questions ADD COLUMN course_id varchar;

-- Clear any existing sample data
DELETE FROM public.assessment_questions;
DELETE FROM public.student_assessments;

-- Insert sample assessments aligned with student_courses
INSERT INTO public.student_assessments (assessment_id, student_id, course_id, assessment_type, assessment_title, obtained_mark, total_marks, due_date_time, performance_level, feedback, status)
VALUES 
  ('ASM-001', '00000000-0000-0000-0000-000000000000', 'CSE-101', 'Quiz', 'Python Basics Quiz', 85, 100, '2024-02-10 23:59:00+00', 'Excellent', 'Great understanding of Python fundamentals', 'Graded'),
  ('ASM-002', '00000000-0000-0000-0000-000000000000', 'CSE-101', 'Assignment', 'Python Functions Assignment', 72, 80, '2024-02-15 23:59:00+00', 'Good', 'Well structured code, minor improvements needed', 'Graded'),
  ('ASM-003', '00000000-0000-0000-0000-000000000000', 'CSE-102', 'Quiz', 'Data Science Fundamentals Quiz', 0, 50, '2024-02-20 23:59:00+00', 'Pending', 'Not yet submitted', 'Not Submitted'),
  ('ASM-004', '00000000-0000-0000-0000-000000000000', 'CSE-103', 'Assignment', 'Web Development Project', 45, 50, '2024-02-25 23:59:00+00', 'Excellent', 'Outstanding work with responsive design', 'Graded'),
  ('ASM-005', '00000000-0000-0000-0000-000000000000', 'CSE-104', 'Quiz', 'Machine Learning Concepts Quiz', 0, 100, '2024-03-01 23:59:00+00', 'Pending', 'Awaiting grading', 'Submitted'),
  ('ASM-006', '00000000-0000-0000-0000-000000000000', 'CSE-105', 'Assignment', 'SQL Database Design', 88, 100, '2024-03-05 23:59:00+00', 'Excellent', 'Excellent normalization and query optimization', 'Graded'),
  ('ASM-007', '00000000-0000-0000-0000-000000000000', 'CSE-106', 'Quiz', 'Cloud Computing Basics Quiz', 65, 80, '2024-03-10 23:59:00+00', 'Good', 'Good understanding of cloud concepts', 'Graded'),
  ('ASM-008', '00000000-0000-0000-0000-000000000000', 'CSE-107', 'Assignment', 'Security Vulnerability Assessment', 0, 100, '2024-03-15 23:59:00+00', 'Pending', 'Not started', 'Not Submitted');

-- Insert sample questions aligned with assessments and courses
INSERT INTO public.assessment_questions (assessment_id, course_id, question_number, question_type, question_text, category, correct_answer)
VALUES 
  ('ASM-001', 'CSE-101', 1, 'MCQ', 'What is a variable in Python?', 'Basics', 'A named storage location in memory'),
  ('ASM-001', 'CSE-101', 2, 'Short Q', 'Explain the difference between int and float data types in Python', 'Data Types', 'Int stores whole numbers, float stores decimal numbers'),
  ('ASM-001', 'CSE-101', 3, 'MCQ', 'Which keyword is used to define a function in Python?', 'Functions', 'def'),
  ('ASM-002', 'CSE-101', 1, 'Coding', 'Write a Python function to calculate factorial', 'Functions', 'def factorial(n): return 1 if n <= 1 else n * factorial(n-1)'),
  ('ASM-003', 'CSE-102', 1, 'MCQ', 'What is the primary library for data manipulation in Python?', 'Libraries', 'Pandas'),
  ('ASM-003', 'CSE-102', 2, 'Short Q', 'Explain the difference between supervised and unsupervised learning', 'ML Basics', 'Supervised uses labeled data, unsupervised finds patterns in unlabeled data'),
  ('ASM-004', 'CSE-103', 1, 'MCQ', 'What does HTML stand for?', 'Web Basics', 'HyperText Markup Language'),
  ('ASM-004', 'CSE-103', 2, 'Coding', 'Create a responsive navigation menu using CSS', 'CSS', 'Use flexbox/grid with media queries'),
  ('ASM-005', 'CSE-104', 1, 'MCQ', 'What is the purpose of a neural network activation function?', 'Neural Networks', 'To introduce non-linearity'),
  ('ASM-005', 'CSE-104', 2, 'Short Q', 'Explain gradient descent algorithm', 'Optimization', 'An optimization algorithm that iteratively adjusts parameters to minimize loss'),
  ('ASM-006', 'CSE-105', 1, 'MCQ', 'What SQL command is used to retrieve data?', 'SQL Basics', 'SELECT'),
  ('ASM-006', 'CSE-105', 2, 'Coding', 'Write a SQL query to join two tables', 'SQL Joins', 'SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.id'),
  ('ASM-007', 'CSE-106', 1, 'MCQ', 'What is IaaS in cloud computing?', 'Cloud Models', 'Infrastructure as a Service'),
  ('ASM-008', 'CSE-107', 1, 'Short Q', 'What is SQL injection and how to prevent it?', 'Security', 'Malicious SQL code injection; prevent with parameterized queries');
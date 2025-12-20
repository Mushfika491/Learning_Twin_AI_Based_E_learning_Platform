-- Add course_code column to certificates for display format like CSE-101
ALTER TABLE public.certificates
ADD COLUMN IF NOT EXISTS course_code varchar(10);
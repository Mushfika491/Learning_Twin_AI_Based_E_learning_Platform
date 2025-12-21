-- Drop the old constraint
ALTER TABLE public.content DROP CONSTRAINT IF EXISTS content_type_check;

-- Add the new constraint with more flexible content types
ALTER TABLE public.content ADD CONSTRAINT content_type_check 
CHECK (type = ANY (ARRAY['video'::text, 'article'::text, 'quiz'::text, 'assignment'::text, 'document'::text, 'link'::text, 'pdf'::text, 'presentation'::text]));
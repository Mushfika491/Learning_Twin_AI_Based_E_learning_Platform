-- Update RLS policy for discussions to allow authenticated users to create discussions
DROP POLICY IF EXISTS "Students can create discussions" ON public.discussions;

CREATE POLICY "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by_user_id);
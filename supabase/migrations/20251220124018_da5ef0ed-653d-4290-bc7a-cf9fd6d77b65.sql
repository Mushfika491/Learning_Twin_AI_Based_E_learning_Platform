-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.admin_reports;

-- Create a more permissive policy for authenticated users to manage reports
CREATE POLICY "Authenticated users can manage reports" 
ON public.admin_reports 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
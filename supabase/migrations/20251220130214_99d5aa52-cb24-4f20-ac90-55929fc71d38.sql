-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_id CHARACTER(7) NOT NULL UNIQUE,
  setting_title VARCHAR(20) NOT NULL,
  category VARCHAR(15) NOT NULL,
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view settings
CREATE POLICY "Authenticated users can view settings" 
ON public.system_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policy for authenticated users to manage settings
CREATE POLICY "Authenticated users can manage settings" 
ON public.system_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert initial data
INSERT INTO public.system_settings (setting_id, setting_title, category) VALUES
('SET-001', 'Site Title', 'General'),
('SET-002', 'Max Upload Size', 'Storage'),
('SET-003', 'Session Timeout', 'Security'),
('SET-004', 'Email Notifications', 'Notifications'),
('SET-005', 'Maintenance Mode', 'General');
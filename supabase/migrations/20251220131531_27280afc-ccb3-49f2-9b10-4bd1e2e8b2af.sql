-- Create admin_activity_logs table
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id CHAR(7) NOT NULL UNIQUE,
  user_id CHAR(7) NOT NULL,
  description VARCHAR(120) NOT NULL,
  timestamps DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Success',
  source_ip_address VARCHAR(45) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view activity logs"
ON public.admin_activity_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage activity logs"
ON public.admin_activity_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert sample data aligned with admin_users
INSERT INTO public.admin_activity_logs (log_id, user_id, description, status, source_ip_address) VALUES
('LOG-001', 'USR-001', 'User login successful', 'Success', '192.168.1.100'),
('LOG-002', 'USR-002', 'Course created: Introduction to Python', 'Success', '192.168.1.101'),
('LOG-003', 'USR-003', 'Profile updated', 'Success', '192.168.1.102'),
('LOG-004', 'USR-001', 'Password change attempted', 'Failed', '192.168.1.100'),
('LOG-005', 'USR-004', 'File uploaded: lecture_notes.pdf', 'Success', '192.168.1.103'),
('LOG-006', 'USR-002', 'Quiz submitted', 'Success', '192.168.1.101'),
('LOG-007', 'USR-005', 'User logout', 'Success', '192.168.1.104'),
('LOG-008', 'USR-003', 'Course enrollment completed', 'Success', '192.168.1.102');
-- Create reports table for admin dashboard
CREATE TABLE public.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id VARCHAR(5) NOT NULL UNIQUE,
  report_title VARCHAR(120) NOT NULL,
  report_type VARCHAR(12) NOT NULL CHECK (report_type IN ('activity', 'performance', 'financial', 'system', 'analytics')),
  course_popularity VARCHAR(15) NOT NULL CHECK (course_popularity IN ('High', 'Medium', 'Low')),
  completion_rate INTEGER NOT NULL CHECK (completion_rate >= 0 AND completion_rate <= 100),
  time_period VARCHAR(8) NOT NULL,
  generated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all reports"
ON public.admin_reports
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view reports"
ON public.admin_reports
FOR SELECT
USING (true);

-- Insert sample data
INSERT INTO public.admin_reports (report_id, report_title, report_type, course_popularity, completion_rate, time_period, generated_at) VALUES
('R-001', 'Monthly User Activity', 'activity', 'High', 78, 'JAN-2025', CURRENT_DATE),
('R-002', 'Course Performance Analysis', 'performance', 'Medium', 65, 'FEB-2025', CURRENT_DATE),
('R-003', 'Financial Overview Q1', 'financial', 'High', 92, 'MAR-2025', CURRENT_DATE),
('R-004', 'System Health Report', 'system', 'Low', 45, 'JAN-2025', CURRENT_DATE),
('R-005', 'Learning Analytics Summary', 'analytics', 'Medium', 71, 'FEB-2025', CURRENT_DATE),
('R-006', 'Student Engagement Metrics', 'activity', 'High', 83, 'MAR-2025', CURRENT_DATE),
('R-007', 'Instructor Performance Review', 'performance', 'Medium', 58, 'JAN-2025', CURRENT_DATE);
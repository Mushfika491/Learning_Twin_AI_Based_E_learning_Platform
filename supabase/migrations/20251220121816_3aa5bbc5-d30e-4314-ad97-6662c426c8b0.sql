-- Create admin_users table for user management by admins
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(7) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(15) NOT NULL CHECK (role IN ('Student', 'Instructor')),
  status VARCHAR(20) NOT NULL DEFAULT 'Issued' CHECK (status IN ('Issued', 'Revoked')),
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all users
CREATE POLICY "Admins can manage all users"
ON public.admin_users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow authenticated users to view users (for demo purposes)
CREATE POLICY "Authenticated users can view users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- Insert demo data
INSERT INTO public.admin_users (user_id, name, phone_number, email, role, status, created_at) VALUES
('USR-001', 'John Doe', '+8801842900265', 'mohimaahmed01@gmail.com', 'Student', 'Issued', '2024-01-15'),
('USR-002', 'Jane Smith', '+8801842900266', 'jane.smith@gmail.com', 'Instructor', 'Issued', '2024-02-20'),
('USR-003', 'Bob Johnson', '+8801842900267', 'bob.johnson@gmail.com', 'Student', 'Issued', '2024-03-10'),
('USR-004', 'Alice Williams', '+8801842900268', 'alice.w@gmail.com', 'Student', 'Revoked', '2024-04-05'),
('USR-005', 'Charlie Brown', '+8801842900269', 'charlie.b@gmail.com', 'Instructor', 'Issued', '2024-05-12'),
('USR-006', 'Diana Ross', '+8801842900270', 'diana.ross@gmail.com', 'Student', 'Issued', '2024-06-08'),
('USR-007', 'Edward Chen', '+8801842900271', 'edward.chen@gmail.com', 'Instructor', 'Revoked', '2024-07-15');
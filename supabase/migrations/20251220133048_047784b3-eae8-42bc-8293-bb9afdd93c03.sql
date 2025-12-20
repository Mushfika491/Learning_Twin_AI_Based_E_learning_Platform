-- Drop the existing check constraint
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_status_check;

-- Update existing status values from 'Issued'/'Revoked' to 'active'/'inactive'
UPDATE public.admin_users SET status = 'active' WHERE status = 'Issued';
UPDATE public.admin_users SET status = 'inactive' WHERE status = 'Revoked';

-- Change the default value for status column
ALTER TABLE public.admin_users ALTER COLUMN status SET DEFAULT 'active';

-- Add new check constraint for active/inactive
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_status_check CHECK (status IN ('active', 'inactive'));
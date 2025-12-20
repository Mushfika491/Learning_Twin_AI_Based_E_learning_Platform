-- Add missing columns to certificates table
ALTER TABLE public.certificates
ADD COLUMN IF NOT EXISTS expiry_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'Issued',
ADD COLUMN IF NOT EXISTS display_id varchar(9);

-- Create a function to generate certificate display IDs
CREATE OR REPLACE FUNCTION generate_certificate_display_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(display_id FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.certificates
  WHERE display_id IS NOT NULL;
  
  NEW.display_id := 'CERT-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating display_id
DROP TRIGGER IF EXISTS set_certificate_display_id ON public.certificates;
CREATE TRIGGER set_certificate_display_id
BEFORE INSERT ON public.certificates
FOR EACH ROW
WHEN (NEW.display_id IS NULL)
EXECUTE FUNCTION generate_certificate_display_id();

-- Add foreign key to courses table
ALTER TABLE public.certificates
DROP CONSTRAINT IF EXISTS certificates_course_id_fkey;

ALTER TABLE public.certificates
ADD CONSTRAINT certificates_course_id_fkey
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Update expiry_date to be 3 years from issue_date for existing records
UPDATE public.certificates
SET expiry_date = issue_date + INTERVAL '3 years'
WHERE expiry_date IS NULL AND issue_date IS NOT NULL;

-- Update display_id for existing records
WITH numbered AS (
  SELECT certificate_id, ROW_NUMBER() OVER (ORDER BY issue_date) as rn
  FROM public.certificates
  WHERE display_id IS NULL
)
UPDATE public.certificates c
SET display_id = 'CERT-' || LPAD(n.rn::TEXT, 3, '0')
FROM numbered n
WHERE c.certificate_id = n.certificate_id;
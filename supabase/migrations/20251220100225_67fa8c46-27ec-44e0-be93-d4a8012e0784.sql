-- Fix function search path for security
CREATE OR REPLACE FUNCTION generate_certificate_display_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
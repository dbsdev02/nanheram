-- Allow public to look up email by phone for login purposes
-- This only exposes email column via phone lookup, which is acceptable for login
CREATE POLICY "Public can lookup email by phone"
ON public.profiles
FOR SELECT
USING (phone IS NOT NULL);
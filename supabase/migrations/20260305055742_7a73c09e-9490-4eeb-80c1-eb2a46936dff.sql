
-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Public can lookup email by phone" ON public.profiles;

CREATE POLICY "Public can lookup email by phone"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (phone IS NOT NULL);

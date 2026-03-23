-- Allow admins to read all profiles for customer management
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

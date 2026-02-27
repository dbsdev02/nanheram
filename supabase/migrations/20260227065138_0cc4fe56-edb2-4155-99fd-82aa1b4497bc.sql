-- Drop the overly permissive policy and replace with one that excludes secrets
DROP POLICY IF EXISTS "Public can read public settings" ON public.admin_settings;

CREATE POLICY "Public can read non-secret settings"
ON public.admin_settings
FOR SELECT
USING (
  setting_key IN ('payment_gateway', 'footer_tagline', 'footer_whatsapp', 'footer_copyright', 'razorpay_key_id', 'stripe_publishable_key')
);
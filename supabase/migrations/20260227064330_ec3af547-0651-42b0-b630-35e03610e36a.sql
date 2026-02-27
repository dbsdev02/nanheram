-- Allow public read of specific admin_settings needed by frontend (payment gateway, footer)
CREATE POLICY "Public can read public settings"
ON public.admin_settings
FOR SELECT
USING (
  setting_group IN ('payment', 'footer', 'general')
  OR setting_key IN ('payment_gateway', 'footer_tagline', 'footer_whatsapp', 'footer_copyright')
);
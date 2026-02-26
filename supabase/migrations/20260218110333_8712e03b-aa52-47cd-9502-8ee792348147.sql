
-- Add hover_image_url and video_url columns to products
ALTER TABLE public.products ADD COLUMN hover_image_url text;
ALTER TABLE public.products ADD COLUMN video_url text;

-- Create storage bucket for product media
INSERT INTO storage.buckets (id, name, public) VALUES ('product-media', 'product-media', true);

-- Allow anyone to view product media
CREATE POLICY "Product media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

-- Allow admins to upload product media
CREATE POLICY "Admins can upload product media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update product media
CREATE POLICY "Admins can update product media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete product media
CREATE POLICY "Admins can delete product media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'::app_role));

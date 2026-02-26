-- Add product_type column to products table
ALTER TABLE public.products 
ADD COLUMN product_type text NOT NULL DEFAULT 'single';

-- Update existing products that have variations to 'variable'
UPDATE public.products 
SET product_type = 'variable' 
WHERE id IN (SELECT DISTINCT product_id FROM public.product_variations);

-- Add coupon update policy for authenticated users (needed for incrementing used_count)
CREATE POLICY "Authenticated users can update coupon usage"
ON public.coupons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
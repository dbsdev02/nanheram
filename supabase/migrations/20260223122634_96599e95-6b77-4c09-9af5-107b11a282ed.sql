
-- Fix products: drop restrictive, create permissive
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);

-- Fix product_images
DROP POLICY IF EXISTS "Product images are publicly readable" ON public.product_images;
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);

-- Fix product_variations
DROP POLICY IF EXISTS "Product variations are publicly readable" ON public.product_variations;
CREATE POLICY "Product variations are publicly readable" ON public.product_variations FOR SELECT USING (true);

-- Fix related_products
DROP POLICY IF EXISTS "Related products are publicly readable" ON public.related_products;
CREATE POLICY "Related products are publicly readable" ON public.related_products FOR SELECT USING (true);

-- Fix coupons
DROP POLICY IF EXISTS "Coupons are publicly readable" ON public.coupons;
CREATE POLICY "Coupons are publicly readable" ON public.coupons FOR SELECT USING (true);

-- Fix reviews - approved publicly readable
DROP POLICY IF EXISTS "Approved reviews are publicly readable" ON public.reviews;
CREATE POLICY "Approved reviews are publicly readable" ON public.reviews FOR SELECT USING (approved = true);

-- Fix user_roles - users read own
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix profiles - users read own
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix cart_items - users read own
DROP POLICY IF EXISTS "Users can read own cart" ON public.cart_items;
CREATE POLICY "Users can read own cart" ON public.cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix orders - users read own
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix order_items - users read own
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

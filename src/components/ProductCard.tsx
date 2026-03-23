import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number | null;
  image_url: string | null;
  hover_image_url?: string | null;
  short_desc: string | null;
  category_label: string;
  in_stock: boolean;
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [hoverImage, setHoverImage] = useState<string | null>(product.hover_image_url || null);

  useEffect(() => {
    // If no hover_image_url set, try fetching the 2nd gallery image
    if (!product.hover_image_url) {
      supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", product.id)
        .order("sort_order")
        .limit(2)
        .then(({ data }) => {
          if (data && data.length > 0) {
            // Use first gallery image as hover (since main image is separate)
            setHoverImage(data[0].image_url);
          }
        });
    }
  }, [product.id, product.hover_image_url]);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden relative">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className={`h-full w-full object-cover transition-all duration-500 ${hoverImage ? "group-hover:opacity-0" : "group-hover:scale-110"}`}
            loading="lazy"
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} hover`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </div>
      </Link>
      <div className="p-4 md:p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category_label}
        </span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-serif text-lg font-semibold text-foreground transition-colors hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {product.short_desc}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            {product.compare_price && (
              <span className="text-sm text-muted-foreground line-through">₹{product.compare_price}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product.id)}
            disabled={!product.in_stock}
            className="rounded-full bg-primary p-2.5 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

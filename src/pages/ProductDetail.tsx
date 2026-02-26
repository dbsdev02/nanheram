import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, Check, ShoppingCart, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange?.(s)} className={onChange ? "cursor-pointer" : "cursor-default"}>
        <Star className={`h-5 w-5 transition-colors ${s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      </button>
    ))}
  </div>
);

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [form, setForm] = useState({ rating: 5, comment: "", reviewer_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [variations, setVariations] = useState<any[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const loadReviews = async (productId: string) => {
    const { data } = await supabase
      .from("reviews").select("*").eq("product_id", productId).eq("approved", true)
      .order("created_at", { ascending: false });
    setReviews(data || []);

    if (user) {
      const { data: own } = await supabase.from("reviews").select("*")
        .eq("product_id", productId).eq("user_id", user.id).maybeSingle();
      setUserReview(own);
      if (own) setForm({ rating: own.rating, comment: own.comment || "", reviewer_name: own.reviewer_name || "" });
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").eq("slug", slug).single();
      setProduct(data);
      if (data) {
        setActiveImage(data.image_url);
        const [gallRes, varRes, relRes] = await Promise.all([
          supabase.from("product_images").select("*").eq("product_id", data.id).order("sort_order"),
          supabase.from("product_variations").select("*").eq("product_id", data.id).order("sort_order"),
          supabase.from("related_products").select("related_product_id, sort_order, products:related_product_id(*)").eq("product_id", data.id).order("sort_order"),
        ]);
        setGalleryImages(gallRes.data || []);
        const vars = varRes.data || [];
        setVariations(vars);
        // Auto-select first available variant for variable products
        if (data.product_type === "variable" && vars.length > 0) {
          const firstAvailable = vars.find((v: any) => v.stock > 0) || vars[0];
          setSelectedVariation(firstAvailable.id);
        } else {
          setSelectedVariation(null);
        }

        // Use admin-managed related products, fallback to random
        const managedRelated = (relRes.data || []).map((r: any) => r.products).filter(Boolean);
        if (managedRelated.length > 0) {
          setRelated(managedRelated);
        } else {
          const { data: fallback } = await supabase.from("products").select("*").neq("id", data.id).limit(3);
          setRelated(fallback || []);
        }
        await loadReviews(data.id);
      }
      setLoading(false);
    };
    load();
  }, [slug, user?.id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmitting(true);

    if (userReview) {
      const { error } = await supabase.from("reviews")
        .update({ rating: form.rating, comment: form.comment, reviewer_name: form.reviewer_name }).eq("id", userReview.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Review updated!", description: "Your review is pending approval." });
    } else {
      const { error } = await supabase.from("reviews").insert({
        product_id: product.id, user_id: user.id, rating: form.rating,
        comment: form.comment, reviewer_name: form.reviewer_name || "Anonymous",
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Review submitted!", description: "It will appear after approval." });
    }
    setSubmitting(false);
    setShowForm(false);
    await loadReviews(product.id);
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const selectedVar = variations.find(v => v.id === selectedVariation);
  const isVariable = product?.product_type === "variable";
  const effectivePrice = isVariable && selectedVar
    ? product.price + selectedVar.price_adjustment
    : product?.price || 0;
  const isOutOfStock = isVariable
    ? selectedVar ? selectedVar.stock <= 0 : !variations.some((v: any) => v.stock > 0)
    : !product?.in_stock;

  if (loading) return <main className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></main>;
  if (!product) return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">Product Not Found</h1>
        <Link to="/shop" className="mt-4 inline-block text-accent underline">Back to Shop</Link>
      </div>
    </main>
  );

  const allImages = [
    ...(product.image_url ? [{ id: "main", image_url: product.image_url }] : []),
    ...(product.hover_image_url ? [{ id: "hover", image_url: product.hover_image_url }] : []),
    ...galleryImages,
  ];

  return (
    <main className="py-10 md:py-16">
      <div className="container">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border bg-muted aspect-square">
              <img src={activeImage || product.image_url || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img) => (
                  <button key={img.id} onClick={() => setActiveImage(img.image_url)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImage === img.image_url ? "border-primary" : "border-border opacity-70 hover:opacity-100"}`}>
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {product.video_url && (
              <div className="overflow-hidden rounded-xl border border-border">
                <video src={product.video_url} controls className="w-full" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{product.category_label}</span>
            <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>

            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} />
                <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            )}

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">₹{effectivePrice}</span>
              {product.compare_price && !selectedVar && <span className="text-lg text-muted-foreground line-through">₹{product.compare_price}</span>}
              {product.compare_price && !selectedVar && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                </span>
              )}
            </div>

            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Product Variations - only for variable products */}
            {isVariable && variations.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-semibold text-foreground">
                  {variations[0]?.attribute_label || "Size"}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variations.map(v => (
                    <button key={v.id} onClick={() => setSelectedVariation(v.id)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                        selectedVariation === v.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary/50"
                      } ${v.stock <= 0 ? "opacity-40 line-through" : ""}`}
                      disabled={v.stock <= 0}
                    >
                      {v.name}
                      {v.price_adjustment !== 0 && (
                        <span className="ml-1 text-xs">({v.price_adjustment > 0 ? "+" : ""}₹{v.price_adjustment})</span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedVar && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selectedVar.stock > 0 ? `${selectedVar.stock} in stock` : "Out of stock"}
                    {selectedVar.sku && ` · SKU: ${selectedVar.sku}`}
                  </p>
                )}
              </div>
            )}

            {(product.benefits || []).length > 0 && (
              <ul className="mt-6 space-y-2">
                {product.benefits.map((b: string) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" /> {b}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => addToCart(product.id, selectedVariation)}
              disabled={isOutOfStock || (isVariable && !selectedVariation)}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? "Out of Stock" : isVariable && !selectedVariation ? "Select a variation" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Customer Reviews</h2>
              {reviews.length > 0 && (
                <div className="mt-2 flex items-center gap-3">
                  <StarRating value={Math.round(avgRating)} />
                  <span className="text-muted-foreground">{avgRating.toFixed(1)} out of 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
            {user && !showForm && (
              <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-full">
                {userReview ? "Edit Your Review" : "Write a Review"}
              </Button>
            )}
            {!user && (
              <Link to="/auth"><Button variant="outline" className="rounded-full">Sign in to Review</Button></Link>
            )}
          </div>

          {showForm && user && (
            <form onSubmit={submitReview} className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{userReview ? "Update Your Review" : "Write a Review"}</h3>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Your Rating</label>
                <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
              <Input value={form.reviewer_name} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} placeholder="Your name (optional)" />
              <Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Share your experience..." rows={3} />
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting} className="rounded-full">
                  {submitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="mt-8 space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {(r.reviewer_name || "A")[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-foreground">{r.reviewer_name || "Anonymous"}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating value={r.rating} />
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                {r.comment && <p className="mt-3 text-muted-foreground leading-relaxed">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-12 text-center">
                <Star className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">You May Also Like</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;

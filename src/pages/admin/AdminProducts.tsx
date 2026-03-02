import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, Image, Video, Images, Layers, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminProductGallery from "./AdminProductGallery";
import AdminVariations from "@/components/admin/AdminVariations";
import AdminRelatedProducts from "@/components/admin/AdminRelatedProducts";

type Product = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  short_desc: string;
  category: string;
  category_label: string;
  price: number;
  compare_price: number | null;
  image_url: string;
  hover_image_url: string;
  video_url: string;
  benefits: string[];
  in_stock: boolean;
  featured: boolean;
  product_type: string;
};

const empty: Product = {
  name: "", slug: "", description: "", short_desc: "", category: "dry-fruits", category_label: "Dry Fruits",
  price: 0, compare_price: null, image_url: "", hover_image_url: "", video_url: "",
  benefits: [], in_stock: true, featured: false, product_type: "single",
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product>(empty);
  const [benefitInput, setBenefitInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [galleryProduct, setGalleryProduct] = useState<{ id: string; name: string } | null>(null);
  const [variationsProduct, setVariationsProduct] = useState<{ id: string; name: string } | null>(null);
  const [relatedProduct, setRelatedProduct] = useState<{ id: string; name: string } | null>(null);

  const imageRef = useRef<HTMLInputElement>(null);
  const hoverRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => { load(); }, []);

  const categoryMap: Record<string, string> = {
    "dry-fruits": "Dry Fruits", "spices": "Spices", "snacks": "Snacks",
  };

  const openNew = () => { setEditing(empty); setOpen(true); setBenefitInput(""); };
  const openEdit = (p: any) => {
    setEditing({ ...empty, ...p, hover_image_url: p.hover_image_url || "", video_url: p.video_url || "", product_type: p.product_type || "single" });
    setOpen(true);
    setBenefitInput("");
  };

  const uploadFile = async (file: File, field: "image_url" | "hover_image_url" | "video_url") => {
    setUploading(prev => ({ ...prev, [field]: true }));
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("product-media").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(prev => ({ ...prev, [field]: false }));
      return;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-media/${path}`;
    setEditing(prev => ({ ...prev, [field]: publicUrl }));
    setUploading(prev => ({ ...prev, [field]: false }));
    toast({ title: "Uploaded successfully" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "hover_image_url" | "video_url") => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, field);
    e.target.value = "";
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setEditing({ ...editing, benefits: [...editing.benefits, benefitInput.trim()] });
      setBenefitInput("");
    }
  };

  const removeBenefit = (i: number) => {
    setEditing({ ...editing, benefits: editing.benefits.filter((_, idx) => idx !== i) });
  };

  const save = async () => {
    setSaving(true);
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-");
    const payload: any = {
      name: editing.name,
      slug,
      description: editing.description,
      short_desc: editing.short_desc,
      category: editing.category,
      category_label: categoryMap[editing.category] || editing.category_label,
      price: editing.price,
      compare_price: editing.compare_price,
      image_url: editing.image_url,
      hover_image_url: editing.hover_image_url || null,
      video_url: editing.video_url || null,
      benefits: editing.benefits,
      in_stock: editing.in_stock,
      featured: editing.featured,
      product_type: editing.product_type,
    };

    if (editing.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) {
        console.error("Product update error:", error);
        toast({ title: "Error updating product", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Product updated" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        console.error("Product insert error:", error);
        toast({ title: "Error adding product", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Product added" });
    }
    setSaving(false);
    setOpen(false);
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    load();
  };

  const MediaUploadBox = ({ label, icon: Icon, field, accept, value }: {
    label: string; icon: any; field: "image_url" | "hover_image_url" | "video_url";
    accept: string; value: string;
  }) => {
    const ref = field === "image_url" ? imageRef : field === "hover_image_url" ? hoverRef : videoRef;
    const isImage = field !== "video_url";

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => handleFileChange(e, field)}
        />
        {value ? (
          <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
            {isImage ? (
              <img src={value} alt={label} className="h-32 w-full object-cover" />
            ) : (
              <video src={value} className="h-32 w-full object-cover" controls />
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => ref.current?.click()}
                className="rounded-full bg-background/80 p-1.5 text-foreground hover:bg-background"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(prev => ({ ...prev, [field]: "" }))}
                className="rounded-full bg-background/80 p-1.5 text-destructive hover:bg-background"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading[field]}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground hover:border-primary/50 hover:bg-muted transition-colors"
          >
            {uploading[field] ? (
              <span className="text-sm">Uploading...</span>
            ) : (
              <>
                <Icon className="h-8 w-8" />
                <span className="text-xs">Click to upload</span>
              </>
            )}
          </button>
        )}
        <Input
          value={value}
          onChange={e => setEditing(prev => ({ ...prev, [field]: e.target.value }))}
          placeholder="Or paste URL"
          className="text-xs"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">Products</h1>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Add Product</Button>
      </div>

      <div className="mt-6 space-y-3">
        {products.map((p: any) => (
          <div key={p.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <img src={p.image_url} alt={p.name} className="h-16 w-16 rounded-md object-cover" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{p.name}</h3>
              <p className="text-sm text-muted-foreground">
                {p.category_label} · ₹{p.price} · {p.product_type === "variable" ? "Variable" : "Single"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.in_stock ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {p.in_stock ? "In Stock" : "Out of Stock"}
              </span>
              <button onClick={() => setGalleryProduct({ id: p.id, name: p.name })} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" title="Gallery"><Images className="h-4 w-4" /></button>
              {p.product_type === "variable" && (
                <button onClick={() => setVariationsProduct({ id: p.id, name: p.name })} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" title="Variations"><Layers className="h-4 w-4" /></button>
              )}
              <button onClick={() => setRelatedProduct({ id: p.id, name: p.name })} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" title="Related"><Link2 className="h-4 w-4" /></button>
              <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => deleteProduct(p.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing.id ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Product Name" />
            <Input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="Slug (auto-generated if empty)" />
            <Textarea value={editing.short_desc} onChange={e => setEditing({ ...editing, short_desc: e.target.value })} placeholder="Short Description" rows={2} />
            <Textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Full Description" rows={3} />
            <select
              value={editing.category}
              onChange={e => setEditing({ ...editing, category: e.target.value, category_label: categoryMap[e.target.value] || e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="dry-fruits">Dry Fruits</option>
              <option value="spices">Spices</option>
              <option value="snacks">Snacks</option>
            </select>
            <div>
              <label className="text-sm font-medium text-foreground">Product Type</label>
              <div className="mt-2 flex gap-3">
                <label className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${editing.product_type === "single" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  <input type="radio" name="product_type" value="single" checked={editing.product_type === "single"} onChange={() => setEditing({ ...editing, product_type: "single" })} className="sr-only" />
                  Single Product
                </label>
                <label className={`flex-1 cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${editing.product_type === "variable" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  <input type="radio" name="product_type" value="variable" checked={editing.product_type === "variable"} onChange={() => setEditing({ ...editing, product_type: "variable" })} className="sr-only" />
                  Multiple Variants
                </label>
              </div>
              {editing.product_type === "single" && (
                <p className="mt-1 text-xs text-muted-foreground">This product has a single price with no size/color variations.</p>
              )}
              {editing.product_type === "variable" && (
                <p className="mt-1 text-xs text-muted-foreground">Add variations (size, color, etc.) after saving. Each variant can have its own price & stock.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} placeholder="Price (₹)" />
              <Input type="number" value={editing.compare_price || ""} onChange={e => setEditing({ ...editing, compare_price: e.target.value ? Number(e.target.value) : null })} placeholder="Compare Price" />
            </div>

            {/* Media Uploads */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Media</h3>
              <div className="grid grid-cols-2 gap-3">
                <MediaUploadBox label="Main Image" icon={Image} field="image_url" accept="image/*" value={editing.image_url} />
                <MediaUploadBox label="Hover Image" icon={Image} field="hover_image_url" accept="image/*" value={editing.hover_image_url} />
              </div>
              <MediaUploadBox label="Product Video" icon={Video} field="video_url" accept="video/*" value={editing.video_url} />
            </div>

            {/* Benefits */}
            <div>
              <label className="text-sm font-medium text-foreground">Benefits</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {editing.benefits.map((b, i) => (
                  <span key={i} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                    {b} <button onClick={() => removeBenefit(i)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input value={benefitInput} onChange={e => setBenefitInput(e.target.value)} placeholder="Add benefit" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addBenefit())} />
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}>Add</Button>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.in_stock} onChange={e => setEditing({ ...editing, in_stock: e.target.checked })} />
                In Stock
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} />
                Featured
              </label>
            </div>

            <Button onClick={save} className="w-full rounded-full" disabled={saving}>
              {saving ? "Saving..." : editing.id ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {galleryProduct && (
        <AdminProductGallery
          productId={galleryProduct.id}
          productName={galleryProduct.name}
          open={!!galleryProduct}
          onOpenChange={open => !open && setGalleryProduct(null)}
        />
      )}

      {variationsProduct && (
        <AdminVariations
          productId={variationsProduct.id}
          productName={variationsProduct.name}
          open={!!variationsProduct}
          onOpenChange={open => !open && setVariationsProduct(null)}
        />
      )}

      {relatedProduct && (
        <AdminRelatedProducts
          productId={relatedProduct.id}
          productName={relatedProduct.name}
          open={!!relatedProduct}
          onOpenChange={open => !open && setRelatedProduct(null)}
        />
      )}
    </div>
  );
};

export default AdminProducts;

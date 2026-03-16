import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const AdminRelatedProducts = ({ productId, productName, open, onOpenChange }: {
  productId: string; productName: string; open: boolean; onOpenChange: (v: boolean) => void;
}) => {
  const { toast } = useToast();
  const [related, setRelated] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const load = async () => {
    const [relRes, prodRes] = await Promise.all([
      supabase.from("related_products").select("id, related_product_id, sort_order, products:related_product_id(id, name, image_url, price)").eq("product_id", productId).order("sort_order"),
      supabase.from("products").select("id, name, image_url, price").neq("id", productId).order("name"),
    ]);
    setRelated(relRes.data || []);
    setAllProducts(prodRes.data || []);
  };

  useEffect(() => { if (open && productId) load(); }, [open, productId]);

  const relatedIds = new Set(related.map(r => r.related_product_id));
  const available = allProducts.filter(p => !relatedIds.has(p.id));

  const addRelated = async (relatedProductId: string) => {
    await supabase.from("related_products").insert({
      product_id: productId,
      related_product_id: relatedProductId,
      sort_order: related.length,
    });
    toast({ title: "Related product added" });
    load();
  };

  const removeRelated = async (id: string) => {
    await supabase.from("related_products").delete().eq("id", id);
    toast({ title: "Related product removed" });
    load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Related Products — {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <h4 className="text-sm font-semibold text-foreground">Current Related Products</h4>
          {related.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No related products set. Add from below.</p>
          )}
          {related.map(r => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
              <img src={r.products?.image_url || "/placeholder.svg"} alt="" className="h-10 w-10 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.products?.name}</p>
                <p className="text-xs text-muted-foreground">₹{r.products?.price}</p>
              </div>
              <button onClick={() => removeRelated(r.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {available.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-foreground mt-6">Add Related Products</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {available.map(p => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3 hover:bg-muted/50 transition-colors">
                    <img src={p.image_url || "/placeholder.svg"} alt="" className="h-10 w-10 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">₹{p.price}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addRelated(p.id)} className="rounded-full">
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRelatedProducts;

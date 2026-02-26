import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Variation = {
  id?: string;
  name: string;
  attribute_label: string;
  price_adjustment: number;
  stock: number;
  sku: string;
  sort_order: number;
};

const emptyVar: Variation = { name: "", attribute_label: "Size", price_adjustment: 0, stock: 0, sku: "", sort_order: 0 };

const AdminVariations = ({ productId, productName, open, onOpenChange }: {
  productId: string; productName: string; open: boolean; onOpenChange: (v: boolean) => void;
}) => {
  const { toast } = useToast();
  const [variations, setVariations] = useState<any[]>([]);
  const [form, setForm] = useState<Variation>(emptyVar);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("product_variations").select("*").eq("product_id", productId).order("sort_order");
    setVariations(data || []);
  };

  useEffect(() => { if (open && productId) load(); }, [open, productId]);

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { ...form, product_id: productId };
    if (form.id) {
      const { id, ...rest } = payload as any;
      await supabase.from("product_variations").update(rest).eq("id", form.id);
    } else {
      const { id, ...rest } = payload as any;
      await supabase.from("product_variations").insert(rest);
    }
    setSaving(false);
    setForm(emptyVar);
    toast({ title: form.id ? "Variation updated" : "Variation added" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("product_variations").delete().eq("id", id);
    toast({ title: "Variation removed" });
    load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Variations — {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Existing variations */}
          {variations.map(v => (
            <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">
                  {v.attribute_label} · {v.price_adjustment > 0 ? "+" : ""}₹{v.price_adjustment} · Stock: {v.stock}
                  {v.sku && ` · SKU: ${v.sku}`}
                </p>
              </div>
              <button onClick={() => setForm(v)} className="text-muted-foreground hover:text-foreground text-xs underline">Edit</button>
              <button onClick={() => remove(v.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}

          {variations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No variations yet. Add one below.</p>
          )}

          {/* Add/Edit form */}
          <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{form.id ? "Edit Variation" : "Add Variation"}</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.attribute_label} onChange={e => setForm({ ...form, attribute_label: e.target.value })} placeholder="Attribute (e.g. Size)" />
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Value (e.g. 500g)" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" value={form.price_adjustment} onChange={e => setForm({ ...form, price_adjustment: Number(e.target.value) })} placeholder="Price +/-" />
              <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Stock" />
              <Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU" />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} size="sm" className="rounded-full">
                <Plus className="mr-1 h-3 w-3" /> {form.id ? "Update" : "Add"}
              </Button>
              {form.id && (
                <Button variant="ghost" size="sm" onClick={() => setForm(emptyVar)}>Cancel</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVariations;

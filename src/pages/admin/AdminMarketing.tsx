import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Coupon = {
  id?: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  is_active: boolean;
  expires_at: string;
};

const empty: Coupon = {
  code: "", description: "", discount_type: "percentage", discount_value: 10,
  min_order_amount: 0, max_uses: null, is_active: true, expires_at: "",
};

const AdminMarketing = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon>(empty);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(empty); setOpen(true); };
  const openEdit = (c: any) => {
    setEditing({
      ...c,
      expires_at: c.expires_at ? new Date(c.expires_at).toISOString().split("T")[0] : "",
      max_uses: c.max_uses ?? null,
    });
    setOpen(true);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setEditing(prev => ({ ...prev, code }));
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const save = async () => {
    setSaving(true);
    const payload: any = {
      code: editing.code.toUpperCase().trim(),
      description: editing.description,
      discount_type: editing.discount_type,
      discount_value: editing.discount_value,
      min_order_amount: editing.min_order_amount,
      max_uses: editing.max_uses,
      is_active: editing.is_active,
      expires_at: editing.expires_at ? new Date(editing.expires_at).toISOString() : null,
    };

    if (editing.id) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Coupon updated" });
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Coupon created!" });
    }

    setSaving(false);
    setOpen(false);
    load();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast({ title: "Coupon deleted" });
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    load();
  };

  const isExpired = (expires_at: string | null) => expires_at && new Date(expires_at) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Marketing</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage coupons & discount codes</p>
        </div>
        <Button onClick={openNew} className="rounded-full"><Plus className="mr-1 h-4 w-4" /> Create Coupon</Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Coupons</p>
          <p className="text-2xl font-bold text-foreground mt-1">{coupons.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Coupons</p>
          <p className="text-2xl font-bold text-foreground mt-1">{coupons.filter(c => c.is_active && !isExpired(c.expires_at)).length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Uses</p>
          <p className="text-2xl font-bold text-foreground mt-1">{coupons.reduce((s, c) => s + (c.used_count || 0), 0)}</p>
        </div>
      </div>

      {/* Coupon List */}
      <div className="mt-6 space-y-3">
        {coupons.map((c: any) => {
          const expired = isExpired(c.expires_at);
          return (
            <div key={c.id} className={`rounded-lg border bg-card p-4 ${!c.is_active || expired ? "opacity-60 border-border" : "border-border"}`}>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">{c.code}</code>
                    <button onClick={() => copyCode(c.code, c.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copiedId === c.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      expired ? "bg-destructive/10 text-destructive" :
                      c.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                    {c.min_order_amount > 0 && ` · Min ₹${c.min_order_amount}`}
                  </p>
                  {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Used: {c.used_count || 0}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                    {c.expires_at && <span>Expires: {new Date(c.expires_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      c.is_active ? "bg-secondary text-foreground hover:bg-muted" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {c.is_active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteCoupon(c.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Tag className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No coupons yet. Create your first coupon!</p>
          </div>
        )}
      </div>

      {/* Coupon Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing.id ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Coupon Code</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                  className="font-mono uppercase"
                />
                <Button type="button" variant="outline" size="sm" onClick={generateCode}>Generate</Button>
              </div>
            </div>

            <Textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Description (internal note)"
              rows={2}
            />

            <div>
              <label className="text-sm font-medium text-foreground">Discount Type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["percentage", "fixed"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditing({ ...editing, discount_type: t })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      editing.discount_type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground"
                    }`}
                  >
                    {t === "percentage" ? "Percentage (%)" : "Fixed Amount (₹)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {editing.discount_type === "percentage" ? "Discount %" : "Discount ₹"}
                </label>
                <Input
                  type="number"
                  value={editing.discount_value}
                  onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Min Order (₹)</label>
                <Input
                  type="number"
                  value={editing.min_order_amount}
                  onChange={(e) => setEditing({ ...editing, min_order_amount: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Max Uses (blank = unlimited)</label>
                <Input
                  type="number"
                  value={editing.max_uses ?? ""}
                  onChange={(e) => setEditing({ ...editing, max_uses: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Expires On</label>
                <Input
                  type="date"
                  value={editing.expires_at}
                  onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              Active (visible to customers)
            </label>

            <Button onClick={save} className="w-full rounded-full" disabled={saving || !editing.code}>
              {saving ? "Saving..." : editing.id ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketing;

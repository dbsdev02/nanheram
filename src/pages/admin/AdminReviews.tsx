import { useEffect, useState } from "react";
import { Star, Check, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, products(name, image_url)")
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (id: string, approved: boolean) => {
    await supabase.from("reviews").update({ approved: !approved }).eq("id", id);
    toast({ title: approved ? "Review hidden" : "Review approved" });
    load();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    toast({ title: "Review deleted" });
    load();
  };

  const filtered = reviews.filter(r => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">Reviews & Ratings</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          {(["all", "pending", "approved"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((r: any) => (
          <div key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              {r.products?.image_url && (
                <img src={r.products.image_url} alt="" className="h-12 w-12 rounded-md object-cover" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">{r.reviewer_name || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">on {r.products?.name || "Unknown"}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.approved ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleApproval(r.id, r.approved)}
                  className="h-8 w-8"
                  title={r.approved ? "Hide review" : "Approve review"}
                >
                  {r.approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4 text-primary" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReview(r.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No reviews found.</p>}
      </div>
    </div>
  );
};

export default AdminReviews;

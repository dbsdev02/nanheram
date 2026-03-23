import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = async (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      console.error("Order update error:", error);
      toast({ title: "Error updating order", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Order marked as ${status}` });
    load();
  };

  const statusColor = (s: string) => {
    if (s === "delivered") return "bg-primary/10 text-primary";
    if (s === "shipped") return "bg-blue-100 text-blue-700";
    if (s === "cancelled") return "bg-destructive/10 text-destructive";
    if (s === "confirmed") return "bg-gold/20 text-warm-brown";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Orders</h1>
      <div className="mt-6 space-y-3">
        {orders.map((o: any) => (
          <div key={o.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <button onClick={() => toggleExpand(o.id)} className="flex w-full items-center justify-between p-4 text-left">
              <div>
                <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
                <p className="text-sm font-medium text-foreground">{o.shipping_name || "—"} · {o.shipping_city || ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(o.status)}`}>{o.status}</span>
                <span className="font-semibold text-foreground">₹{Number(o.total).toFixed(2)}</span>
              </div>
            </button>
            {expandedId === o.id && (
              <div className="border-t border-border p-4 bg-secondary/30">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div><span className="text-muted-foreground">Phone:</span> {o.shipping_phone}</div>
                  <div><span className="text-muted-foreground">Address:</span> {o.shipping_address}, {o.shipping_city}, {o.shipping_state} - {o.shipping_pincode}</div>
                  <div><span className="text-muted-foreground">Payment:</span> {o.payment_method}</div>
                  <div><span className="text-muted-foreground">Date:</span> {new Date(o.created_at).toLocaleString()}</div>
                  {o.notes && <div className="md:col-span-2"><span className="text-muted-foreground">Notes:</span> {o.notes}</div>}
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground">Items</h4>
                  {(orderItems[o.id] || []).map((item: any) => (
                    <div key={item.id} className="mt-1 flex justify-between text-sm">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o.id, s)}
                      disabled={o.status === s}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                        o.status === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;

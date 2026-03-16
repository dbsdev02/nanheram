import { useEffect, useState } from "react";
import { Package, ShoppingCart, IndianRupee, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("products").select("id"),
      ]);
      const orders = ordersRes.data || [];
      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s: number, o: any) => s + Number(o.total), 0),
        totalProducts: productsRes.data?.length || 0,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
      });
      setRecentOrders(orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
    };
    load();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-primary/10 text-primary" },
    { label: "Revenue", value: `₹${stats.totalRevenue.toFixed(2)}`, icon: IndianRupee, color: "bg-accent/10 text-accent" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-gold/20 text-warm-brown" },
    { label: "Pending", value: stats.pendingOrders, icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <div className={`rounded-full p-2 ${c.color}`}><c.icon className="h-4 w-4" /></div>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-serif text-xl font-semibold text-foreground">Recent Orders</h2>
      <div className="mt-4 space-y-3">
        {recentOrders.map((o: any) => (
          <div key={o.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
              <p className="text-sm font-medium text-foreground">{o.shipping_name || "—"}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">₹{Number(o.total).toFixed(2)}</p>
              <span className="text-xs text-muted-foreground capitalize">{o.status}</span>
            </div>
          </div>
        ))}
        {recentOrders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;

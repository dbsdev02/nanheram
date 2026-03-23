import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      });
    });
  }, [user, navigate]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update(profile).eq("user_id", user.id);
    toast({ title: "Profile updated" });
    setSaving(false);
  };

  const statusColor = (s: string) => {
    if (s === "delivered") return "bg-primary/10 text-primary";
    if (s === "shipped") return "bg-blue-100 text-blue-700";
    if (s === "cancelled") return "bg-destructive/10 text-destructive";
    return "bg-gold/20 text-warm-brown";
  };

  return (
    <main className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-foreground">My Account</h1>
          <div className="flex gap-2">
            {isAdmin && (
              <Link to="/admin" className="rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-all">
                Admin Panel
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={() => setTab("orders")} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${tab === "orders" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <Package className="mr-1 inline h-4 w-4" /> Orders
          </button>
          <button onClick={() => setTab("profile")} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${tab === "profile" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <User className="mr-1 inline h-4 w-4" /> Profile
          </button>
        </div>

        {tab === "orders" && (
          <div className="mt-8 space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground">No orders yet.</p>
                <Link to="/shop" className="mt-2 inline-block text-accent underline">Start shopping</Link>
              </div>
            ) : orders.map(order => (
              <Link key={order.id} to={`/order-confirmation/${order.id}`} className="block rounded-lg border border-border bg-card p-5 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <p className="mt-1 font-semibold text-foreground">₹{Number(order.total).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(order.status)}`}>{order.status}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="mt-8 space-y-4 max-w-md">
            <Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Full Name" />
            <Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
            <Input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Address" />
            <div className="grid grid-cols-3 gap-3">
              <Input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="City" />
              <Input value={profile.state} onChange={e => setProfile({ ...profile, state: e.target.value })} placeholder="State" />
              <Input value={profile.pincode} onChange={e => setProfile({ ...profile, pincode: e.target.value })} placeholder="Pincode" />
            </div>
            <Button onClick={saveProfile} className="rounded-full" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;

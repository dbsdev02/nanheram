import { useEffect, useState } from "react";
import { Users, Package, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Customer = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Get all profiles
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      // Get all orders grouped by user
      const { data: orders } = await supabase.from("orders").select("user_id, total");

      const orderMap: Record<string, { count: number; spent: number }> = {};
      (orders || []).forEach((o: any) => {
        if (!o.user_id) return;
        if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, spent: 0 };
        orderMap[o.user_id].count++;
        orderMap[o.user_id].spent += Number(o.total);
      });

      const customerList: Customer[] = (profiles || []).map((p: any) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        phone: p.phone,
        city: p.city,
        state: p.state,
        created_at: p.created_at,
        total_orders: orderMap[p.user_id]?.count || 0,
        total_spent: orderMap[p.user_id]?.spent || 0,
      }));

      setCustomers(customerList);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = customers.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.full_name?.toLowerCase().includes(q)) ||
           (c.phone?.toLowerCase().includes(q)) ||
           (c.city?.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} registered customer{customers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, city..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="mt-8 text-center text-muted-foreground">Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No customers found</p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(c.full_name || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{c.full_name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      <Package className="h-3 w-3" /> {c.total_orders}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">₹{c.total_spent.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;

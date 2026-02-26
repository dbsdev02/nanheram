import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!orderId) return;
    supabase.from("orders").select("*").eq("id", orderId).single().then(({ data }) => setOrder(data));
    supabase.from("order_items").select("*").eq("order_id", orderId).then(({ data }) => setItems(data || []));
  }, [orderId]);

  if (!order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading order...</p>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-20">
      <div className="container max-w-2xl text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your order. We'll get it to you soon.</p>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono text-xs text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary capitalize">{order.status}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground capitalize">{order.payment_method === "razorpay" ? "Razorpay (Online)" : "Cash on Delivery"}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Ship to</span>
            <span className="text-right text-foreground">{order.shipping_name}, {order.shipping_city}</span>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <h3 className="font-semibold text-foreground">Items</h3>
            <div className="mt-2 space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                  <span className="text-foreground">₹{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4 flex justify-between font-semibold text-foreground text-lg">
            <span>Total</span>
            <span>₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/dashboard" className="rounded-full border border-primary px-6 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all">
            My Orders
          </Link>
          <Link to="/shop" className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmation;

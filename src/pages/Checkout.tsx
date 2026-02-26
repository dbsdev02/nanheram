import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Truck, Tag, X, ChevronLeft, Package, CreditCard, Banknote } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", notes: "",
  });

  // Payment gateway state
  const [enabledMethods, setEnabledMethods] = useState<string[]>(["cod"]);
  const [selectedMethod, setSelectedMethod] = useState<string>("cod");
  const [gatewayLoading, setGatewayLoading] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);

  useEffect(() => {
    if (!user) navigate("/auth");
    if (items.length === 0) navigate("/cart");
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setForm(f => ({
            ...f,
            name: data.full_name || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
          }));
        }
      });
      setForm(f => ({ ...f, email: user.email || "" }));
    }
  }, [user, items.length, navigate]);

  // Fetch enabled payment methods
  useEffect(() => {
    const fetchGateway = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "payment_gateway")
        .single();
      const methods = (data?.setting_value || "cod").split(",").filter(Boolean);
      setEnabledMethods(methods);
      setSelectedMethod(methods[0] || "cod");
      setGatewayLoading(false);
    };
    fetchGateway();
  }, []);

  // Load Razorpay script when needed
  useEffect(() => {
    if (enabledMethods.includes("razorpay")) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, [enabledMethods]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      toast({ title: "Invalid coupon", description: "This coupon code is not valid.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast({ title: "Coupon expired", description: "This coupon has expired.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      toast({ title: "Coupon limit reached", description: "This coupon has been fully redeemed.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.min_order_amount && totalPrice < Number(data.min_order_amount)) {
      toast({ title: "Minimum not met", description: `Minimum order amount is ₹${data.min_order_amount}.`, variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: Number(data.discount_value) });
    toast({ title: "Coupon applied!", description: `Discount of ${data.discount_type === "percentage" ? `${data.discount_value}%` : `₹${data.discount_value}`} applied.` });
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (totalPrice * appliedCoupon.discount_value) / 100
      : Math.min(appliedCoupon.discount_value, totalPrice)
    : 0;

  const finalTotal = totalPrice - discountAmount;

  const createOrder = async (paymentMethod: string) => {
    if (!user) return null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: finalTotal,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
        payment_method: paymentMethod,
        notes: form.notes || null,
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discountAmount,
        status: paymentMethod === "cod" ? "pending" : "awaiting_payment",
      })
      .select()
      .single();

    if (orderError || !order) {
      toast({ title: "Error", description: "Could not place order.", variant: "destructive" });
      return null;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name || "",
      product_image: item.product?.image_url || null,
      quantity: item.quantity,
      price: (item.product?.price || 0) + (item.variation?.price_adjustment || 0),
    }));

    await supabase.from("order_items").insert(orderItems);

    if (appliedCoupon) {
      const { data: couponData } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("code", appliedCoupon.code)
        .single();
      if (couponData) {
        await supabase
          .from("coupons")
          .update({ used_count: couponData.used_count + 1 })
          .eq("code", appliedCoupon.code);
      }
    }

    return order;
  };

  const handleCODSubmit = async () => {
    setLoading(true);
    const order = await createOrder("cod");
    if (!order) { setLoading(false); return; }
    await clearCart();
    setLoading(false);
    navigate(`/order-confirmation/${order.id}`);
  };

  const handleRazorpaySubmit = async () => {
    setLoading(true);

    const order = await createOrder("razorpay");
    if (!order) { setLoading(false); return; }

    try {
      // Create Razorpay order via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ amount: finalTotal, order_id: order.id }),
        }
      );

      const razorpayData = await res.json();

      if (!res.ok || !razorpayData.razorpay_order_id) {
        toast({ title: "Error", description: razorpayData.error || "Failed to initiate payment.", variant: "destructive" });
        // Clean up the failed order
        await supabase.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: razorpayData.razorpay_key_id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "NanheRam",
        description: `Order #${order.id.slice(0, 8).toUpperCase()}`,
        order_id: razorpayData.razorpay_order_id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        handler: async (response: any) => {
          // Verify payment on backend
          const verifyRes = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            await clearCart();
            navigate(`/order-confirmation/${order.id}`);
          } else {
            toast({ title: "Payment failed", description: "Payment verification failed. Please contact support.", variant: "destructive" });
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            toast({ title: "Payment cancelled", description: "You can retry or choose a different payment method." });
            setLoading(false);
          },
        },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast({ title: "Error", description: "Payment initiation failed.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedMethod === "razorpay") {
      await handleRazorpaySubmit();
    } else {
      await handleCODSubmit();
    }
  };

  return (
    <main className="py-8 md:py-16">
      <div className="container max-w-6xl">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Checkout</h1>

        {/* Trust badges */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Secure Checkout
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" /> Free Shipping on ₹500+
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4 text-primary" /> {enabledMethods.includes("razorpay") ? "Online Payment Available" : "Cash on Delivery Available"}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: Shipping Form */}
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
            {/* Contact Information */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">Contact Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" required />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">Shipping Address</h2>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House/Flat No., Building, Street, Locality" required rows={2} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="State" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="6-digit pincode" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">Additional Information</h2>
              <div className="mt-4 space-y-2">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Special instructions for delivery, gift message, etc." rows={3} />
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">Payment Method</h2>
              {gatewayLoading ? (
                <p className="mt-4 text-sm text-muted-foreground">Loading payment options...</p>
              ) : (
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="mt-4 space-y-3">
                  {enabledMethods.includes("cod") && (
                    <label htmlFor="pm-cod" className={`flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all ${selectedMethod === "cod" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
                      <RadioGroupItem value="cod" id="pm-cod" />
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2"><Banknote className="h-4 w-4" /> Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </label>
                  )}
                  {enabledMethods.includes("razorpay") && (
                    <label htmlFor="pm-razorpay" className={`flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all ${selectedMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
                      <RadioGroupItem value="razorpay" id="pm-razorpay" />
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> Pay Online (Razorpay)</p>
                        <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking, Wallets</p>
                      </div>
                    </label>
                  )}
                  {enabledMethods.includes("stripe") && (
                    <label htmlFor="pm-stripe" className={`flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all ${selectedMethod === "stripe" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
                      <RadioGroupItem value="stripe" id="pm-stripe" />
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> Pay Online (Stripe)</p>
                        <p className="text-sm text-muted-foreground">International Cards</p>
                      </div>
                    </label>
                  )}
                </RadioGroup>
              )}
            </div>

            <Button type="submit" className="w-full rounded-full py-6 text-base font-semibold" size="lg" disabled={loading}>
              {loading
                ? "Processing..."
                : selectedMethod === "razorpay"
                  ? `Pay ₹${finalTotal.toFixed(2)}`
                  : `Place Order — ₹${finalTotal.toFixed(2)}`}
            </Button>
          </form>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-4">
              <h2 className="font-serif text-xl font-semibold text-foreground">Order Summary</h2>
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                      <img src={item.product?.image_url || "/placeholder.svg"} alt={item.product?.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product?.name}</p>
                      {item.variation && (
                        <p className="text-xs text-muted-foreground">{item.variation.attribute_label}: {item.variation.name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      ₹{(item.quantity * ((item.product?.price || 0) + (item.variation?.price_adjustment || 0))).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mt-4 border-t border-border pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{appliedCoupon.code}</span>
                      <span className="text-xs text-muted-foreground">
                        (-{appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `₹${appliedCoupon.discount_value}`})
                      </span>
                    </div>
                    <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="text-sm"
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    />
                    <Button variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading} className="whitespace-nowrap">
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary font-medium">{totalPrice >= 500 ? "Free" : "₹50.00"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{(finalTotal + (totalPrice < 500 ? 50 : 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

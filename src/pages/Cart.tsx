import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, loading, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">Sign in to view your cart</h1>
          <Link to="/auth" className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-4 font-serif text-2xl font-bold text-foreground">Your cart is empty</h1>
          <Link to="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Shopping Cart</h1>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <Link to={`/product/${item.product?.slug}`} className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                <img src={item.product?.image_url || ""} alt={item.product?.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1">
              <Link to={`/product/${item.product?.slug}`} className="font-serif text-lg font-semibold text-foreground hover:text-accent">
                  {item.product?.name}
                </Link>
                {item.variation && (
                  <p className="text-xs text-muted-foreground">{item.variation.attribute_label}: {item.variation.name}</p>
                )}
                <p className="text-sm font-medium text-accent">₹{((item.product?.price || 0) + (item.variation?.price_adjustment || 0))}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.variation_id)} className="rounded-full border border-border p-1 hover:bg-secondary">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.variation_id)} className="rounded-full border border-border p-1 hover:bg-secondary">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="w-20 text-right font-semibold text-foreground">₹{(item.quantity * ((item.product?.price || 0) + (item.variation?.price_adjustment || 0))).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.product_id, item.variation_id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between text-lg font-semibold text-foreground">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
            <Button className="mt-4 w-full rounded-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Cart;

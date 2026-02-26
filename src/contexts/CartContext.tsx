import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  variation_id: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string | null;
    in_stock: boolean;
  };
  variation?: {
    id: string;
    name: string;
    attribute_label: string;
    price_adjustment: number;
  } | null;
};

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, variationId?: string | null) => Promise<void>;
  removeFromCart: (productId: string, variationId?: string | null) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variationId?: string | null) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, variation_id, products:product_id(id, name, slug, price, image_url, in_stock)")
      .eq("user_id", user.id);
    
    if (!error && data) {
      // Fetch variation details for items that have variations
      const variationIds = data.filter((d: any) => d.variation_id).map((d: any) => d.variation_id);
      let variationsMap: Record<string, any> = {};
      if (variationIds.length > 0) {
        const { data: vars } = await supabase
          .from("product_variations")
          .select("id, name, attribute_label, price_adjustment")
          .in("id", variationIds);
        if (vars) {
          variationsMap = Object.fromEntries(vars.map(v => [v.id, v]));
        }
      }

      setItems(data.map((d: any) => ({
        id: d.id,
        product_id: d.product_id,
        quantity: d.quantity,
        variation_id: d.variation_id,
        product: d.products,
        variation: d.variation_id ? variationsMap[d.variation_id] || null : null,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId: string, variationId?: string | null) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to sign in to add items to cart.", variant: "destructive" });
      return;
    }

    // Fetch product name for notification
    const { data: productData } = await supabase.from("products").select("name").eq("id", productId).single();
    const productName = productData?.name || "Product";

    const existing = items.find(i => i.product_id === productId && (i.variation_id || null) === (variationId || null));
    if (existing) {
      await updateQuantity(productId, existing.quantity + 1, variationId);
      toast({ title: "Cart updated!", description: `${productName} quantity increased.` });
      return;
    }

    const insertData: any = { user_id: user.id, product_id: productId, quantity: 1 };
    if (variationId) insertData.variation_id = variationId;

    const { error } = await supabase.from("cart_items").insert(insertData);
    if (error) {
      toast({ title: "Error", description: "Could not add to cart.", variant: "destructive" });
    } else {
      toast({ title: "Added to cart!", description: `${productName} has been added to your cart.` });
      await fetchCart();
    }
  };

  const removeFromCart = async (productId: string, variationId?: string | null) => {
    if (!user) return;
    let query = supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
    if (variationId) query = query.eq("variation_id", variationId);
    else query = query.is("variation_id", null);
    await query;
    await fetchCart();
  };

  const updateQuantity = async (productId: string, quantity: number, variationId?: string | null) => {
    if (!user) return;
    if (quantity <= 0) { await removeFromCart(productId, variationId); return; }
    let query = supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("product_id", productId);
    if (variationId) query = query.eq("variation_id", variationId);
    else query = query.is("variation_id", null);
    await query;
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => {
    const basePrice = i.product?.price || 0;
    const adjustment = i.variation?.price_adjustment || 0;
    return s + i.quantity * (basePrice + adjustment);
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
